import type { RequestManagementDetails } from "./requestManagementTypes";
import "./RequestCaseDetails.css";

// Defines the data required to display an individual request.
interface RequestCaseDetailsProps {
  details: RequestManagementDetails;
}

/**
 * Displays the details of a selected service request.
 *
 * Requirement: FR-STF-005
 * Staff must be able to view the full information of a request.
 */
export default function RequestCaseDetails({
  details,
}: RequestCaseDetailsProps) {
  // Check against null because zero is a valid coordinate.
  const hasCoordinates =
    details.latitude !== null &&
    details.longitude !== null;

  return (
    <section
      className="request-case-details"
      aria-labelledby="request-case-details-title"
    >
      <header className="request-case-details__header">
        <div className="request-case-details__heading">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            description
          </span>

          <div>
            <span className="request-case-details__eyebrow">
              Case Reference: {details.caseReference}
            </span>

            <h2 id="request-case-details-title">
              Incident Specifications &amp; Field Intelligence
            </h2>
          </div>
        </div>

        <span className="request-case-details__origin">
          Origin: {details.origin}
        </span>
      </header>

      <div className="request-case-details__classification">
        <div className="request-case-details__field">
          <span className="request-case-details__label">
            Subcategory
          </span>
          <strong>{details.subcategory}</strong>
        </div>

        <div className="request-case-details__field">
          <span className="request-case-details__label">
            Routing Department
          </span>
          <strong>{details.routingDepartment}</strong>
        </div>

        <div className="request-case-details__field">
          <span className="request-case-details__label">
            Current Lifecycle Stage
          </span>
          <strong>{details.currentStage}</strong>
        </div>
      </div>

      <div className="request-case-details__section">
        <h3>Constituent Narrative Description</h3>

        <p className="request-case-details__narrative">
          {details.constituentNarrative}
        </p>
      </div>

      <div className="request-case-details__section">
        <h3>Geospatial Information</h3>

        <div className="request-case-details__location">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            location_on
          </span>

          <div>
            {hasCoordinates ? (
              <>
                <strong>Recorded coordinates</strong>

                <p>Latitude: {details.latitude}</p>
                <p>Longitude: {details.longitude}</p>

                <span className="request-case-details__hint">
                  Coordinates supplied by the case record;
                  location has not been independently verified.
                </span>
              </>
            ) : (
              <>
                <strong>Location unavailable</strong>

                <p>
                  No geospatial coordinates have been recorded
                  for this request.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}