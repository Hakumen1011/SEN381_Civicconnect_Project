import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { homeForRole, type LoginMode } from "./roles";
import "./login.css";

export default function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>("requester");
  const [registering, setRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (auth.session) return <Navigate to={homeForRole(auth.session.user.role)} replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const session = registering
        ? await auth.register(name, email, password)
        : await auth.signIn(email, password, mode);
      setPassword("");
      navigate(homeForRole(session.user.role), { replace: true });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Authentication failed.");
    } finally { setBusy(false); }
  }

  function switchMode(next: LoginMode) {
    setMode(next); setRegistering(false); setError(""); setPassword("");
  }

  return (
    <main className="civic-login">
      <section className="civic-login__panel" aria-labelledby="civic-login-title">
        <div className="civic-login__brand">
          <span aria-hidden="true" className="material-symbols-outlined">account_balance</span>
          <div><strong>CivicConnect</strong><span>Municipal Service Portal</span></div>
        </div>
        <h1 id="civic-login-title">{registering ? "Create requester account" : mode === "staff" ? "Staff & Management Login" : "Requester Login"}</h1>
        <p>{mode === "staff" ? "Sign in with an authorised STAFF, MANAGER or ADMIN account." : "Sign in to submit municipal requests and track your cases."}</p>
        {error && <p className="civic-login__error" role="alert">{error}</p>}
        <form onSubmit={submit} className="civic-login__form">
          {registering && <label>Full name<input value={name} onChange={e => setName(e.target.value)} autoComplete="name" required /></label>}
          <label>Email address<input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required /></label>
          <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete={registering ? "new-password" : "current-password"} required /></label>
          <button type="submit" className="civic-login__submit" disabled={busy}>{busy ? "Please wait..." : registering ? "Create account" : "Sign in"}</button>
        </form>
        <div className="civic-login__footer">
          {mode === "requester" && <button type="button" className="civic-login__link" onClick={() => { setRegistering(!registering); setError(""); }}>{registering ? "Already registered? Sign in" : "New requester? Register"}</button>}
          <button type="button" className="civic-login__switch" aria-pressed={mode === "staff"} onClick={() => switchMode(mode === "staff" ? "requester" : "staff")}>{mode === "staff" ? "Requester Login" : "Login as Staff/Management"}</button>
        </div>
      </section>
    </main>
  );
}
