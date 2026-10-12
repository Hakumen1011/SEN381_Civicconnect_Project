import { describe, expect, it } from 'vitest';
import { SimpleCategoryRules } from '../src/modules/requests/categoryRules.js';
import { ALLOWED_TRANSITIONS, canTransition, isFinal } from '../src/modules/requests/statusTransitions.js';
import { STATUSES } from '../src/modules/requests/request.types.js';
import { dueDateFor, isOverdue } from '../src/modules/requests/serviceLevels.js';

describe('Status workflow (FR-STF-007)', () => {
  it('allows the normal path from submitted to closed', () => {
    expect(canTransition('SUBMITTED', 'ASSIGNED')).toBe(true);
    expect(canTransition('ASSIGNED', 'IN_PROGRESS')).toBe(true);
    expect(canTransition('IN_PROGRESS', 'RESOLVED')).toBe(true);
    expect(canTransition('RESOLVED', 'CLOSED')).toBe(true);
  });

  it('rejects skipping steps or moving backwards (AC-STF-007-B)', () => {
    expect(canTransition('SUBMITTED', 'RESOLVED')).toBe(false);
    expect(canTransition('SUBMITTED', 'CLOSED')).toBe(false);
    expect(canTransition('IN_PROGRESS', 'SUBMITTED')).toBe(false);
  });

  it('treats CLOSED and REJECTED as final', () => {
    expect(isFinal('CLOSED')).toBe(true);
    expect(isFinal('REJECTED')).toBe(true);
    expect(isFinal('IN_PROGRESS')).toBe(false);
  });

  it('only refers to known statuses', () => {
    for (const targets of Object.values(ALLOWED_TRANSITIONS)) {
      for (const t of targets) expect(STATUSES).toContain(t);
    }
  });
});

describe('Category rules (Decision 9)', () => {
  const rules = new SimpleCategoryRules();
  it('gives security concerns high priority', () => {
    expect(rules.initialPriority('SECURITY_CONCERN')).toBe('HIGH');
    expect(rules.initialPriority('FACILITY_FAULT')).toBe('MEDIUM');
    expect(rules.initialPriority('LOST_PROPERTY')).toBe('LOW');
  });
  it('requires a location for physical problems only', () => {
    expect(rules.requiresLocation('FACILITY_FAULT')).toBe(true);
    expect(rules.requiresLocation('IT_SUPPORT')).toBe(false);
  });
});

describe('Service levels (FR-MGT-002)', () => {
  it('sets a due date from the priority', () => {
    const created = new Date('2026-01-01T00:00:00Z');
    expect(dueDateFor('HIGH', created)).toBe('2026-01-02T00:00:00.000Z');
    expect(dueDateFor('MEDIUM', created)).toBe('2026-01-04T00:00:00.000Z');
  });
  it('is overdue only when open and past the due date', () => {
    const past = '2000-01-01T00:00:00.000Z';
    expect(isOverdue({ status: 'IN_PROGRESS', dueAt: past })).toBe(true);
    expect(isOverdue({ status: 'RESOLVED', dueAt: past })).toBe(false);
    expect(isOverdue({ status: 'SUBMITTED', dueAt: '2999-01-01T00:00:00.000Z' })).toBe(false);
  });
});
