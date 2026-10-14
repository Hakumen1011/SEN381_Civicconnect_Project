-- CivicConnect – initial PostgreSQL schema (migration 001)
--
-- Engineering Decision Log, Decision 7 (layered integrity):
--   * business rules (workflow, permissions) live in the application services;
--   * this schema adds a second safety net: NOT NULL, CHECK, UNIQUE and FOREIGN KEY
--     constraints, so bad data cannot be stored even if application code has a bug.
--   * every change to a request (status + history + notifications) is saved in ONE
--     transaction by the application (BEGIN ... COMMIT / ROLLBACK).
--   * service_requests.version is the concurrency token used to detect conflicting edits.
--
-- The allowed values below must match the lists in the TypeScript code:
--   roles        -> src/modules/users/user.types.ts            (ROLES)
--   categories   -> src/modules/requests/request.types.ts      (CATEGORIES)
--   statuses     -> src/modules/requests/request.types.ts      (STATUSES)
--   priorities   -> src/modules/requests/request.types.ts      (PRIORITIES)
--   channels     -> src/modules/notifications/notification.types.ts (CHANNELS, NOTIFICATION_STATUSES)

-- ---------------------------------------------------------------------------
-- Users and roles (FR-SEC-001, FR-SEC-002, NFR-SEC-002, FR-NOT-002)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id                    uuid         PRIMARY KEY,
    name                  text         NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    email                 text         NOT NULL UNIQUE
                                       CHECK (email = lower(email) AND char_length(email) <= 254),
    password_hash         text         NOT NULL,          -- bcrypt hash only, never the password
    role                  text         NOT NULL
                                       CHECK (role IN ('REQUESTER', 'STAFF', 'MANAGER', 'ADMIN')),
    phone                 text         NULL
                                       CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),   -- E.164 format
    sms_opted_in_at       timestamptz  NULL,               -- explicit opt-in with date/time
    whatsapp_opted_in_at  timestamptz  NULL,
    created_at            timestamptz  NOT NULL DEFAULT now(),
    -- SMS / WhatsApp opt-in is only possible with a phone number
    CONSTRAINT users_opt_in_needs_phone
        CHECK ((sms_opted_in_at IS NULL AND whatsapp_opted_in_at IS NULL) OR phone IS NOT NULL)
);

-- ---------------------------------------------------------------------------
-- Service requests (FR-REQ-001 to FR-REQ-007, FR-STF-001 to FR-STF-010)
-- ---------------------------------------------------------------------------
-- Human-friendly reference numbers, e.g. CC-2026-000001 (FR-REQ-003).
-- Note: a sequence never goes backwards, so a rolled-back submission leaves a gap in the
-- numbering. That is normal and acceptable: references only need to be unique.
CREATE SEQUENCE request_reference_seq START 1;

CREATE TABLE service_requests (
    id            uuid         PRIMARY KEY,
    reference     text         NOT NULL UNIQUE CHECK (reference ~ '^CC-[0-9]{4}-[0-9]{6,}$'),
    requester_id  uuid         NOT NULL REFERENCES users (id),
    title         text         NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
    description   text         NOT NULL CHECK (char_length(description) BETWEEN 1 AND 4000),
    category      text         NOT NULL CHECK (category IN (
                                   'FACILITY_FAULT', 'DAMAGED_EQUIPMENT', 'SECURITY_CONCERN',
                                   'IT_SUPPORT', 'MAINTENANCE', 'LOST_PROPERTY', 'OTHER')),
    location      text         NOT NULL DEFAULT '' CHECK (char_length(location) <= 200),
    priority      text         NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    status        text         NOT NULL CHECK (status IN (
                                   'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD',
                                   'RESOLVED', 'CLOSED', 'REJECTED')),
    assignee_id   uuid         NULL REFERENCES users (id),
    resolution    text         NULL,
    due_at        timestamptz  NOT NULL,                   -- service-level target (FR-MGT-002)
    created_at    timestamptz  NOT NULL,
    updated_at    timestamptz  NOT NULL,
    version       integer      NOT NULL DEFAULT 1 CHECK (version >= 1),   -- concurrency token
    -- Work that is being handled must have an owner (FR-STF-006)
    CONSTRAINT requests_active_work_has_owner
        CHECK (status NOT IN ('ASSIGNED', 'IN_PROGRESS', 'ON_HOLD') OR assignee_id IS NOT NULL),
    -- A resolved or closed request must say how it was resolved (FR-STF-009)
    CONSTRAINT requests_resolved_has_resolution
        CHECK (status NOT IN ('RESOLVED', 'CLOSED') OR resolution IS NOT NULL),
    CONSTRAINT requests_dates_in_order
        CHECK (updated_at >= created_at)
);

-- Indexes on the fields staff and managers filter and sort on (FR-STF-002 to FR-STF-004, FR-MGT-001 to 004)
CREATE INDEX service_requests_requester_idx ON service_requests (requester_id, created_at DESC);
CREATE INDEX service_requests_assignee_idx  ON service_requests (assignee_id);
CREATE INDEX service_requests_status_idx    ON service_requests (status);
CREATE INDEX service_requests_category_idx  ON service_requests (category);
CREATE INDEX service_requests_created_idx   ON service_requests (created_at DESC);
-- Only open work can be overdue, so this index stays small
CREATE INDEX service_requests_open_due_idx  ON service_requests (due_at)
    WHERE status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD');

-- ---------------------------------------------------------------------------
-- Audit trail: one row per status change (FR-SEC-004, FR-MGT-005, NFR-AUD-001)
-- ---------------------------------------------------------------------------
CREATE TABLE status_history (
    id             uuid         PRIMARY KEY,
    seq            bigint       GENERATED ALWAYS AS IDENTITY,   -- keeps the exact order of events
    request_id     uuid         NOT NULL REFERENCES service_requests (id),
    from_status    text         NULL CHECK (from_status IN (
                                    'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD',
                                    'RESOLVED', 'CLOSED', 'REJECTED')),
    to_status      text         NOT NULL CHECK (to_status IN (
                                    'SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD',
                                    'RESOLVED', 'CLOSED', 'REJECTED')),
    changed_by_id  uuid         NOT NULL REFERENCES users (id),
    note           text         NULL CHECK (char_length(note) <= 2000),
    changed_at     timestamptz  NOT NULL
);
CREATE INDEX status_history_request_idx ON status_history (request_id, changed_at, seq);

-- The audit trail is append-only: rows can be added but never changed or deleted.
CREATE FUNCTION status_history_is_append_only() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'status_history is append-only (audit trail cannot be changed)';
END;
$$;

CREATE TRIGGER status_history_no_update_or_delete
    BEFORE UPDATE OR DELETE ON status_history
    FOR EACH ROW EXECUTE FUNCTION status_history_is_append_only();

-- ---------------------------------------------------------------------------
-- Staff actions and comments (FR-STF-008)
-- ---------------------------------------------------------------------------
CREATE TABLE request_comments (
    id          uuid         PRIMARY KEY,
    seq         bigint       GENERATED ALWAYS AS IDENTITY,
    request_id  uuid         NOT NULL REFERENCES service_requests (id),
    author_id   uuid         NOT NULL REFERENCES users (id),
    body        text         NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
    created_at  timestamptz  NOT NULL
);
CREATE INDEX request_comments_request_idx ON request_comments (request_id, created_at, seq);

-- ---------------------------------------------------------------------------
-- Notification log / outbox (FR-NOT-001 to FR-NOT-007)
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id                   uuid         PRIMARY KEY,
    seq                  bigint       GENERATED ALWAYS AS IDENTITY,
    request_id           uuid         NOT NULL REFERENCES service_requests (id),
    reference            text         NOT NULL,
    recipient_id         uuid         NOT NULL REFERENCES users (id),
    channel              text         NOT NULL CHECK (channel IN ('IN_APP', 'SMS', 'WHATSAPP')),
    address              text         NULL,              -- phone number for SMS / WhatsApp
    template             text         NOT NULL,
    message              text         NOT NULL,
    status               text         NOT NULL CHECK (status IN (
                                          'QUEUED', 'SENT', 'DELIVERED', 'UNDELIVERED', 'FAILED')),
    attempts             integer      NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 3),
    provider_message_id  text         NULL,
    last_error           text         NULL,
    flagged              boolean      NOT NULL DEFAULT false,
    created_at           timestamptz  NOT NULL,
    updated_at           timestamptz  NOT NULL,
    -- SMS and WhatsApp messages need a phone number; in-app messages do not
    CONSTRAINT notifications_external_needs_address
        CHECK (channel = 'IN_APP' OR address IS NOT NULL)
);
CREATE INDEX notifications_recipient_idx ON notifications (recipient_id, created_at DESC);
CREATE INDEX notifications_request_idx   ON notifications (request_id);
-- The background sender only looks at messages that still need work
CREATE INDEX notifications_pending_idx   ON notifications (status)
    WHERE status IN ('QUEUED', 'SENT', 'FAILED');
