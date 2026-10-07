import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  categoryOptions,
  type RequestDraft,
} from "../requesterData";

import RequestCategorySelector from "./RequestCategorySelector";

interface RequestFormProps {
  onSubmitted: (request: RequestDraft) => void;
}

const DEFAULT_TITLE =
  "Pedestrian Crossing Light Faulty • North Meridian Ave";

const DEFAULT_DESCRIPTION =
  "Street lamp arm 04-B is completely non-responsive during dusk hours. High foot-traffic crossing zone near the primary school crosswalk.";

const DEFAULT_LOCATION =
  "842 North Meridian Ave, Sector 4, Civic Heights";

export default function RequestForm({
  onSubmitted,
}: RequestFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedCategory, setSelectedCategory] =
    useState("street-lighting");

  const [title, setTitle] = useState(DEFAULT_TITLE);
  const [description, setDescription] =
    useState(DEFAULT_DESCRIPTION);
  const [location, setLocation] =
    useState(DEFAULT_LOCATION);

  const [selectedFile, setSelectedFile] = useState<File | null>(
    null,
  );

  const [previewUrl, setPreviewUrl] = useState<string | null>(
    null,
  );

  const [errors, setErrors] = useState<string[]>([]);
  const [gpsMessage, setGpsMessage] = useState("");
  const [submissionMessage, setSubmissionMessage] =
    useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const createPreview = (file: File | null) => {
    setPreviewUrl((currentPreview) => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }

      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleFile = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const supportedTypes = [
      "image/png",
      "image/jpeg",
      "image/heic",
    ];

    if (!supportedTypes.includes(file.type)) {
      setErrors(["Please select a PNG, JPG or HEIC image."]);
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setErrors(["Images must be 15 MB or smaller."]);
      return;
    }

    setErrors([]);
    setSelectedFile(file);
    createPreview(file);
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleCurrentGps = () => {
    if (!navigator.geolocation) {
      setGpsMessage(
        "GPS is not supported by this browser.",
      );
      return;
    }

    setGpsMessage("Requesting location permission...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(4);
        const longitude =
          position.coords.longitude.toFixed(4);

        setLocation(
          `GPS coordinates: ${latitude}, ${longitude}`,
        );

        setGpsMessage(
          "Current browser location captured.",
        );
      },
      () => {
        setGpsMessage(
          "Location permission was unavailable. Enter the location manually.",
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  };

  const handleClear = () => {
    setSelectedCategory("street-lighting");
    setTitle("");
    setDescription("");
    setLocation("");
    setSelectedFile(null);
    createPreview(null);
    setErrors([]);
    setGpsMessage("");
    setSubmissionMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!selectedCategory) {
      validationErrors.push(
        "Please select a request category.",
      );
    }

    if (!title.trim()) {
      validationErrors.push("Request title is required.");
    }

    if (!description.trim()) {
      validationErrors.push(
        "Request description is required.",
      );
    }

    return validationErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const selectedCategoryLabel =
      categoryOptions.find(
        (category) => category.id === selectedCategory,
      )?.label ?? selectedCategory;

    const request: RequestDraft = {
      category: selectedCategoryLabel,
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      fileName: selectedFile?.name,
    };

    onSubmitted(request);

    setErrors([]);
    setSubmissionMessage(
      "Request prepared successfully for submission.",
    );
  };

  return (
    <section className="request-form-card">
      <div className="request-section-heading">
        <div>
          <span className="eyebrow-label">
            New Citizen Report
          </span>

          <h2>Log Municipal Service Request</h2>
        </div>

        <div className="response-target">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            schedule
          </span>

          <span>
            Target Response: 24–48 Business Hours
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-alert form-alert--error" role="alert">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            error
          </span>

          <div>
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        </div>
      )}

      {submissionMessage && (
        <div
          className="form-alert form-alert--success"
          role="status"
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            check_circle
          </span>

          <p>{submissionMessage}</p>
        </div>
      )}

      <div className="form-section">
        <div className="form-label-row">
          <label className="form-label">
            1. Select Infrastructure Category
          </label>

          <span className="form-helper">
            Choose one
          </span>
        </div>

        <RequestCategorySelector
            categories={categoryOptions}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
        />
        
      </div>

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-field">
          <label htmlFor="ticketTitle" className="form-label">
            2. Request Title <span className="required">*</span>
          </label>

          <input
            id="ticketTitle"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Brief summary of the issue"
          />
        </div>

        <div className="form-field">
          <label htmlFor="ticketDescription" className="form-label">
            3. Detailed Description{" "}
            <span className="required">*</span>
          </label>

          <textarea
            id="ticketDescription"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Provide contextual markers, nearest cross street, hazard level, or relevant observations..."
            rows={4}
          />
        </div>

        <div className="form-field">
          <div className="form-label-row">
            <label htmlFor="ticketLocation" className="form-label">
              4. Physical Location / Geotag
            </label>

            <button
              type="button"
              className="gps-button"
              onClick={handleCurrentGps}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                my_location
              </span>

              Use Current GPS
            </button>
          </div>

          <div className="location-input">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              pin_drop
            </span>

            <input
              id="ticketLocation"
              type="text"
              value={location}
              onChange={(event) =>
                setLocation(event.target.value)
              }
              placeholder="Enter physical address or location"
            />
          </div>

          {gpsMessage && (
            <p className="field-helper">{gpsMessage}</p>
          )}

          <div className="map-preview" aria-label="Map preview">
            <div className="map-preview__road map-preview__road--one" />
            <div className="map-preview__road map-preview__road--two" />
            <div className="map-preview__road map-preview__road--three" />

            <div className="map-preview__water" />

            <div className="map-preview__park">
              Greenway
            </div>

            <div className="map-preview__pin-label">
              <span className="map-preview__pin-dot" />
              Pin #440-A
            </div>

            <span
              className="material-symbols-outlined map-preview__pin"
              aria-hidden="true"
            >
              location_on
            </span>

            <div className="map-preview__coordinates">
              Lat: 47.6062° N • Long: 122.3321° W
            </div>
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">
            5. Photographic Evidence (Optional)
          </label>

          <div className="attachment-grid">
            <div
              className="upload-zone"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  fileInputRef.current?.click();
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                add_a_photo
              </span>

              <strong>
                Click to upload or drag files
              </strong>

              <span>
                PNG, JPG, HEIC up to 15MB
              </span>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/heic"
                onChange={handleFileChange}
                hidden
              />
            </div>

            <div className="attachment-preview">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={`Selected attachment ${selectedFile?.name ?? ""}`}
                  />

                  <button
                    type="button"
                    className="attachment-delete"
                    onClick={() => {
                      setSelectedFile(null);
                      createPreview(null);

                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    aria-label="Remove attachment"
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      delete
                    </span>
                  </button>

                  <span className="attachment-name">
                    {selectedFile?.name}
                  </span>
                </>
              ) : (
                <div className="attachment-preview__empty">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    image
                  </span>

                  <span>No image selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <div className="verified-account">
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              shield
            </span>

            <span>
              Recorded under verified constituent account
              Eleanor Vance
            </span>
          </div>

          <div className="form-action-buttons">
            <button
              type="button"
              className="button button--secondary"
              onClick={handleClear}
            >
              Clear
            </button>

            <button
              type="submit"
              className="button button--primary"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                send
              </span>

              Submit Official Ticket
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}