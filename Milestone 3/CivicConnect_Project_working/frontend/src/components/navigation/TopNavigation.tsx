import { useState } from "react";
import { useOptionalAuth } from "../../auth/AuthContext";
import { NAVIGATION, navigationForRole, type NavigationId } from "../../auth/roles";
import logo from "../../assets/CivicConnect-Logo.svg";
import RouteAnchor from "./RouteAnchor";
import "./TopNavigation.css";

export type { NavigationId } from "../../auth/roles";
interface TopNavigationProps { activeNavigation?: NavigationId; onNavigate?: (id: NavigationId) => void; }

export default function TopNavigation({activeNavigation = "requester-self-service",onNavigate}: TopNavigationProps) {
  const auth = useOptionalAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const entries = auth ? (auth.session ? navigationForRole(auth.session.user.role) : []) : NAVIGATION;
  const user = auth?.session?.user;
  function signOut() { auth?.signOut(); window.location.assign("/login"); }
  return <header className="top-navigation">
    <div className="top-navigation__main">
      <div className="top-navigation__brand"><img src={logo} alt="CivicConnect Logo" className="top-navigation__logo" />
        <div className="top-navigation__brand-text"><span className="top-navigation__title">CivicConnect</span><span className="top-navigation__subtitle">Municipal Service Operations</span></div>
      </div>
      <div className="top-navigation__divider" />
      <nav id="civicconnect-primary-navigation" className={`top-navigation__links ${mobileMenuOpen ? "top-navigation__links--open" : ""}`} aria-label="Primary navigation">
        {entries.map(entry => <RouteAnchor key={entry.id} href={entry.path}
          className={`top-navigation__link ${activeNavigation === entry.id ? "top-navigation__link--active" : ""}`}
          current={activeNavigation === entry.id ? "page" : undefined}
          onClick={e => { if(onNavigate){e.preventDefault();onNavigate(entry.id);} setMobileMenuOpen(false); }}>{entry.label}</RouteAnchor>)}
      </nav>
      <button type="button" className="top-navigation__mobile-toggle" aria-label={mobileMenuOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileMenuOpen} aria-controls="civicconnect-primary-navigation" onClick={() => setMobileMenuOpen(open => !open)}><span className="material-symbols-outlined" aria-hidden="true">{mobileMenuOpen ? "close" : "menu"}</span></button>
      <div className="top-navigation__actions">
        {user && <><div className="top-navigation__profile"><div className="top-navigation__profile-avatar">{user.name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase()}</div><div className="top-navigation__profile-details"><div className="top-navigation__profile-name">{user.name}</div><div className="top-navigation__profile-role">{user.role}</div></div></div><button type="button" className="civic-top-signout" onClick={signOut}>Sign out</button></>}
      </div>
    </div>
    <div className="top-navigation__division"><div className="top-navigation__division-left"><span className="material-symbols-outlined" aria-hidden="true">account_balance</span><span>CivicConnect service requests</span></div><div className="top-navigation__division-right">{user ? `Signed in as ${user.role}` : "Service Portal"}</div></div>
  </header>;
}
