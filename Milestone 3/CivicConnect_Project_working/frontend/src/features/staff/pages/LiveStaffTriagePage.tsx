import OperationsShell from "../../../layouts/OperationsShell";
import StaffLiveWorkbench from "../live/StaffLiveWorkbench";
import "./StaffTriagePage.css";

/** Release-facing staff route. The older illustrative page is kept in source for design reference only. */
export default function LiveStaffTriagePage() {
  return (
    <OperationsShell activeNavigation="staff-triage">
      <div className="staff-page">
        <div className="staff-page__heading">
          <div>
            <span className="staff-eyebrow">CIVICCONNECT / STAFF OPERATIONS</span>
            <h1>Staff Triage Queue</h1>
            <p>Work directly with authenticated municipal service requests.</p>
          </div>
          <div className="staff-page__heading-status"><span className="staff-live-dot" />Live backend records</div>
        </div>
        <StaffLiveWorkbench />
      </div>
    </OperationsShell>
  );
}
