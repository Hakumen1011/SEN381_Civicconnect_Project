import "./TopNavigation.css";
import logo from "../../assets/CivicConnect-Logo.svg";



export type NavigationId =
    | "staff-triage"
    | "request-management"
    | "requester-self-service"
    | "management-analytics";

interface TopNavigationProps {
    activeNavigation?: NavigationId;
    onNavigate?: (navigationId: NavigationId) => void;
}

const navigationItems: Array<{
    id: NavigationId;
    label: string;
    path: string;
}> = [
    {
        id: "staff-triage",
        label: "Staff Triage Queue",
        path: "/staff-triage",
    },
    {
        id: "request-management",
        label: "Request Management",
        path: "/request-management",
    },
    {
        id: "requester-self-service",
        label: "Requester Self-Service",
        path: "/requester-self-service",
    },
    {
        id: "management-analytics",
        label: "Management & Analytics",
        path: "/management",
    },
];

export default function TopNavigation({
    activeNavigation = "requester-self-service",
    onNavigate,
}: TopNavigationProps) {
    return (
        <header className="top-navigation">
            <div className="top-navigation__main">
                {/* Brand */}
                <div className="top-navigation__brand">
                    <img
                        src={logo}
                        alt="CivicConnect Logo"
                        className="top-navigation__logo"
                    />

                    <div className="top-navigation__brand-text">
                        <span className="top-navigation__title">
                            CivicConnect
                        </span>

                        <span className="top-navigation__subtitle">
                            Municipal Service Operations
                        </span>
                    </div>
                </div>

                <div className="top-navigation__divider" />

                {/* Main navigation */}
                <nav
                    className="top-navigation__links"
                    aria-label="Primary navigation"
                >
                    {navigationItems.map((item) => (
                        <a
                            key={item.id}
                            href={item.path}
                            className={`top-navigation__link ${
                                item.id === activeNavigation
                                    ? "top-navigation__link--active"
                                    : ""
                            }`}
                            aria-current={
                                item.id === activeNavigation
                                    ? "page"
                                    : undefined
                            }
                            onClick={(event) => {
                                if (onNavigate) {
                                    event.preventDefault();
                                    onNavigate(item.id);
                                }
                            }}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                {/* Right side */}
                <div className="top-navigation__actions">
                    <div className="top-navigation__search">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            search
                        </span>

                        <input
                            type="search"
                            placeholder="Search by Case #, Citizen, Category..."
                            aria-label="Search CivicConnect"
                        />
                    </div>

                    <div className="top-navigation__role">
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            verified_user
                        </span>

                        <div className="top-navigation__role-text">
                            <span className="top-navigation__role-label">
                                Active Role
                            </span>

                            <span className="top-navigation__role-value">
                                Staff Operations / Oversight
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="top-navigation__notification"
                        aria-label="Notifications"
                    >
                        <span
                            className="material-symbols-outlined"
                            aria-hidden="true"
                        >
                            notifications
                        </span>

                        <span className="top-navigation__notification-count">
                            3
                        </span>
                    </button>

                    <div className="top-navigation__profile">
                        <div className="top-navigation__profile-avatar">
                            EV
                        </div>

                        <div className="top-navigation__profile-details">
                            <div className="top-navigation__profile-name">
                                Eleanor Vance
                            </div>

                            <div className="top-navigation__profile-role">
                                Senior Operations Lead
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Division information */}
            <div className="top-navigation__division">
                <div className="top-navigation__division-left">
                    <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                    >
                        account_balance
                    </span>

                    <span>
                        Public Works &amp; Urban Services Division
                    </span>

                    <span>•</span>

                    <strong>
                        Sector 4 Operational Casework
                    </strong>
                </div>

                <div className="division-bar__status">
                    <span className="division-status">
                    <span className="division-status__dot" />
                        Dispatch Feeds Synced
                    </span>

                    <span className="division-bar__separator">|</span>

                    <span>SLA Response Window: 99.4%</span>
                </div>

                <div className="top-navigation__division-right">
                    Civic Service Portal
                </div>
            </div>
        </header>
    );
}