import { useEffect, useState, type FormEvent } from "react";
import { useOptionalAuth } from "../../auth/AuthContext";

import OperationsShell from "../../layouts/OperationsShell";

import RequestForm from "./components/RequestForm";

import RecentSubmissions from "./components/RecentSubmissions";

import TicketTracker from "./components/TicketTracker";

import {

  type RequestDraft,

  type SubmissionRecord,

} from "./requesterData";

import "./RequesterPortal.css";

import {

  getMyRequest,

  listMyRequests,

  loginRequester,

  registerRequester,

  submitMunicipalRequest,

  MUNICIPAL_CATEGORY_CODES,

  type AuthSession,

  type BackendServiceRequest,

} from "./requesterApi";

const statusLabels: Record<

  BackendServiceRequest["status"],

  SubmissionRecord["status"]

> = {

  SUBMITTED: "Submitted",

  ASSIGNED: "Assigned",

  IN_PROGRESS: "In Progress",

  ON_HOLD: "On Hold",

  RESOLVED: "Resolved",

  CLOSED: "Closed",

  REJECTED: "Rejected",

};

function toSubmissionRecord(

  request: BackendServiceRequest,

): SubmissionRecord {

  const categoryLabel =

    Object.entries(MUNICIPAL_CATEGORY_CODES).find(

      ([, code]) => code === request.category,

    )?.[0] ?? request.category.replace(/_/g, " ");

  return {

    caseId: request.reference,

    category: categoryLabel,

    title: request.title,

    location: request.location,

    dateFiled: new Date(request.createdAt).toLocaleDateString(

      "en-ZA",

      {

        day: "2-digit",

        month: "short",

        year: "numeric",

      },

    ),

    status: statusLabels[request.status],

  };

}

export default function RequesterPortal() {

 const centralAuth = useOptionalAuth();
 const [localSession, setLocalSession] = useState<AuthSession | null>(null);
 const session = centralAuth ? centralAuth.session : localSession;
 useEffect(() => {
   if (!centralAuth?.session || centralAuth.session.user.role !== "REQUESTER") return;
   let active = true;
   listMyRequests(centralAuth.session.token).then(result => {
     if (active) setSubmissions(result.items.map(toSubmissionRecord));
   }).catch(() => {
     if (active) setSubmissionNotice("Signed in, but existing requests could not be loaded.");
   });
   return () => { active = false; };
 }, [centralAuth?.session?.token]);

const [submissions, setSubmissions] =

  useState<SubmissionRecord[]>([]);

const [authMode, setAuthMode] =

  useState<"login" | "register">("register");

const [name, setName] = useState("");

const [email, setEmail] = useState("");

const [password, setPassword] = useState("");

const [authBusy, setAuthBusy] = useState(false);

const [authError, setAuthError] = useState("");

const [submissionNotice, setSubmissionNotice] =

  useState("");

const activeTicketCount = submissions.filter(

  (submission) =>

    !["Resolved", "Closed", "Rejected"].includes(

      submission.status,

    ),

).length;

const handleAuthSubmit = async (

  event: FormEvent<HTMLFormElement>,

) => {

  event.preventDefault();

  setAuthBusy(true);

  setAuthError("");

  try {

    const authenticated =

      authMode === "register"

        ? await registerRequester({

            name: name.trim(),

            email: email.trim(),

            password,

          })

        : await loginRequester({

            email: email.trim(),

            password,

          });

    setLocalSession(authenticated);

    setPassword("");

    try {

      const result = await listMyRequests(

        authenticated.token,

      );

      setSubmissions(

        result.items.map(toSubmissionRecord),

      );

    } catch {

      setSubmissionNotice(

        "Signed in successfully, but existing requests could not be loaded.",

      );

    }

  } catch (error) {

    setAuthError(

      error instanceof Error

        ? error.message

        : "Authentication failed.",

    );

  } finally {

    setAuthBusy(false);

  }

};

const handleRequestSubmitted = async (

  request: RequestDraft,

): Promise<void> => {

  if (!session) {

    throw new Error(

      "Please sign in before submitting a request.",

    );

  }

  const created = await submitMunicipalRequest(

    request,

    session.token,

  );

  setSubmissions((current) => [

    toSubmissionRecord(created.request),

    ...current.filter(

      (item) =>

        item.caseId !== created.request.reference,

    ),

  ]);

  setSubmissionNotice(

    `Request ${created.request.reference} was recorded by the CivicConnect API.`,

  );

  // Check that the created record can also be retrieved.

  // A retrieval failure must not misrepresent the

  // already successful submission as a failed POST.

  try {

    const verified = await getMyRequest(

      created.request.id,

      session.token,

    );

    setSubmissions((current) =>

      current.map((item) =>

        item.caseId === verified.request.reference

          ? toSubmissionRecord(verified.request)

          : item,

      ),

    );

  } catch {

    setSubmissionNotice(

      `Request ${created.request.reference} was submitted, but detail retrieval could not be verified.`,

    );

  }

};

const handleSignOut = () => {

  setLocalSession(null);
  centralAuth?.signOut();

  setSubmissions([]);

  setSubmissionNotice("");

};

  return (

    <OperationsShell activeNavigation="requester-self-service">

      <div className="requester-page">

        <div className="requester-page__content">

          <section className="requester-hero">

            <div className="requester-hero__background requester-hero__background--one" />

            <div className="requester-hero__background requester-hero__background--two" />

            <div className="requester-hero__content">

              <div className="requester-hero__copy">

                <span className="portal-status-pill">

                  <span className="portal-status-pill__dot" />

                  CIVIC PORTAL ACTIVE • DISTRICT 04 METRO

                </span>

                <h1>

                  {session

                    ? `Welcome back, ${session.user.name}`

                  : "Welcome to CivicConnect"}

                </h1>

                <p>

                  Report urban infrastructure defects, view

                  ongoing municipal remediation, and monitor

                  public works dispatches across your precinct.

                </p>

              </div>

              <div className="requester-hero__metrics">

                <div className="hero-stat">

                  <div className="hero-stat__icon">

                    <span

                      className="material-symbols-outlined"

                      aria-hidden="true"

                    >

                      assignment_turned_in

                    </span>

                  </div>

                  <div>

                    <strong>{activeTicketCount}</strong>

                    <span>Active Tickets Filed</span>

                  </div>

                </div>

                <div className="emergency-notice">

                  <span

                    className="material-symbols-outlined"

                    aria-hidden="true"

                  >

                    emergency

                  </span>

                  <div>

                    <strong>Urgent Hazard Notice</strong>

                    <span>

                      Immediate hazard or downed power line?

                    </span>

                    <button

                      type="button"

                      className="emergency-link"

                      onClick={() =>

                        setSubmissionNotice(

                          "For an actual emergency, use the municipality's official emergency contact channel.",

                        )

                      }

                    >

                      Use official emergency contacts

                    </button>

                  </div>

                </div>

              </div>

            </div>

          </section>

          {submissionNotice && (

            <div

              className="page-notice"

              role="status"

            >

              <span

                className="material-symbols-outlined"

                aria-hidden="true"

              >

                info

              </span>

              <span>{submissionNotice}</span>

              <button

                type="button"

                onClick={() => setSubmissionNotice("")}

                aria-label="Dismiss notice"

              >

                <span

                  className="material-symbols-outlined"

                  aria-hidden="true"

                >

                  close

                </span>

              </button>

            </div>

          )}
          {session ? (

          <>

            <div style={{ marginBottom: "1rem" }}>

              <button

                type="button"

                className="button button--secondary"

                onClick={handleSignOut}

              >

                Sign out

              </button>

            </div>

    <div className="requester-grid">

      <RequestForm

        onSubmitted={handleRequestSubmitted}

        requesterName={session.user.name}

      />

      <TicketTracker

        submissions={submissions}

        caseId={submissions[0]?.caseId}

      />

    </div>

    <RecentSubmissions submissions={submissions} />

  </>

) : (

  <section

    className="request-form-card"

    aria-label="Requester authentication"

  >

    <h2>

      {authMode === "register"

        ? "Create Requester Account"

        : "Requester Sign In"}

    </h2>

    <p>

      Sign in to submit municipal service requests

      and access your own request history.

    </p>

    {authError && (

      <p role="alert">{authError}</p>

    )}

    <form

      onSubmit={handleAuthSubmit}

      className="request-form"

    >

      {authMode === "register" && (

        <div className="form-field">

          <label

            htmlFor="requesterName"

            className="form-label"

          >

            Full Name

          </label>

          <input

            id="requesterName"

            type="text"

            value={name}

            onChange={(event) =>

              setName(event.target.value)

            }

            required

          />

        </div>

      )}

      <div className="form-field">

        <label

          htmlFor="requesterEmail"

          className="form-label"

        >

          Email

        </label>

        <input

          id="requesterEmail"

          type="email"

          value={email}

          onChange={(event) =>

            setEmail(event.target.value)

          }

          required

        />

      </div>

      <div className="form-field">

        <label

          htmlFor="requesterPassword"

          className="form-label"

        >

          Password

        </label>

        <input

          id="requesterPassword"

          type="password"

          value={password}

          onChange={(event) =>

            setPassword(event.target.value)

          }

          required

        />

      </div>

      <button

        type="submit"

        className="button button--primary"

        disabled={authBusy}

      >

        {authBusy

          ? "Please wait..."

          : authMode === "register"

            ? "Register and Continue"

            : "Sign In"}

      </button>

    </form>

    <p style={{ marginTop: "1rem" }}>

      {authMode === "register"

        ? "Already have an account?"

        : "Need an account?"}

      {" "}

      <button

        type="button"

        className="button button--secondary"

        onClick={() => {

          setAuthMode(

            authMode === "register"

              ? "login"

              : "register",

          );

          setAuthError("");

        }}

      >

        {authMode === "register"

          ? "Sign In"

          : "Register"}

      </button>

    </p>

  </section>

)}

        </div>

      </div>

    </OperationsShell>

  );

}