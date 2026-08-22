"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type LocationResult = {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  countryCode?: string;
};

type LocationSearchResponse = {
  success: boolean;
  data?: {
    locations: LocationResult[];
  };
  error?: string;
};

type TimezoneResponse = {
  success: boolean;
  data?: {
    timezone: string;
  };
  error?: string;
};

type OnboardingLocationStepProps = {
  latitude: string;
  longitude: string;
  timezone: string;
  onLocationChange: (
    latitude: string,
    longitude: string,
    timezone: string,
  ) => void;
  onError: (
    error: string | null,
  ) => void;
};

export default function OnboardingLocationStep({
  latitude,
  longitude,
  timezone,
  onLocationChange,
  onError,
}: OnboardingLocationStepProps) {
  const [
    locationQuery,
    setLocationQuery,
  ] = useState("");

  const [
    locationResults,
    setLocationResults,
  ] = useState<LocationResult[]>([]);

  const [
    isSearching,
    setIsSearching,
  ] = useState(false);

  const [
    isResolvingTimezone,
    setIsResolvingTimezone,
  ] = useState(false);

  const searchRequestId =
    useRef(0);

  useEffect(() => {
    const query =
      locationQuery.trim();

    if (query.length < 2) {
      setLocationResults([]);
      setIsSearching(false);
      return;
    }

    const requestId =
      searchRequestId.current + 1;

    searchRequestId.current =
      requestId;

    const timeout =
      window.setTimeout(
        async () => {
          setIsSearching(true);

          try {
            const response =
              await fetch(
                `/api/location/search?query=${encodeURIComponent(
                  query,
                )}&country=US`,
              );

            const result:
              LocationSearchResponse =
              await response.json();

            if (
              searchRequestId.current !==
              requestId
            ) {
              return;
            }

            if (
              !response.ok ||
              !result.success
            ) {
              throw new Error(
                result.error ??
                  "Unable to search locations.",
              );
            }

            setLocationResults(
              result.data?.locations ?? [],
            );
          } catch {
            if (
              searchRequestId.current ===
              requestId
            ) {
              setLocationResults([]);
            }
          } finally {
            if (
              searchRequestId.current ===
              requestId
            ) {
              setIsSearching(false);
            }
          }
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeout,
      );
    };
  }, [locationQuery]);

  async function selectLocation(
    location: LocationResult,
  ) {
    if (
      location.countryCode &&
      location.countryCode !== "US"
    ) {
      onError(
        "This location is not supported yet. HeatOps currently supports sites in the United States.",
      );

      return;
    }

    setLocationResults([]);
    setLocationQuery(
      location.formattedAddress,
    );

    setIsResolvingTimezone(true);
    onError(null);

    try {
      const response =
        await fetch(
          `/api/location/timezone?latitude=${encodeURIComponent(
            location.latitude,
          )}&longitude=${encodeURIComponent(
            location.longitude,
          )}`,
        );

      const result:
        TimezoneResponse =
        await response.json();

      if (
        !response.ok ||
        !result.success ||
        !result.data?.timezone
      ) {
        throw new Error(
          result.error ??
            "Unable to resolve timezone.",
        );
      }

      onLocationChange(
        String(location.latitude),
        String(location.longitude),
        result.data.timezone,
      );
    } catch {
      onLocationChange(
        String(location.latitude),
        String(location.longitude),
        timezone,
      );

      onError(
        "The location was selected, but its timezone could not be resolved automatically.",
      );
    } finally {
      setIsResolvingTimezone(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-medium text-orange-400">
        Site location
      </p>

      <h2 className="mt-2 text-2xl font-semibold text-white">
        Where is this site located?
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
        Search for a city, address, or place in the
        United States. HeatOps uses your site&apos;s
        location and local time to evaluate upcoming
        conditions while your operation is active.
      </p>

      <div className="mt-8">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">
            Search location
          </span>

          <input
            value={locationQuery}
            onChange={(event) => {
              setLocationQuery(
                event.target.value,
              );

              onError(null);
            }}
            placeholder="Search a U.S. city, address, or place"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>

        <p className="mt-3 text-xs text-slate-500">
          HeatOps currently supports sites located in
          the United States.
        </p>

        {isSearching && (
          <p className="mt-4 text-sm text-slate-500">
            Searching locations...
          </p>
        )}

        {!isSearching &&
          locationQuery.trim().length >= 2 &&
          locationResults.length === 0 && (
            <p className="mt-4 text-sm text-slate-500">
              No supported locations found.
            </p>
          )}

        {locationResults.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
            {locationResults.map(
              (location) => (
                <button
                  key={location.id}
                  type="button"
                  onClick={() =>
                    void selectLocation(
                      location,
                    )
                  }
                  className="flex w-full flex-col gap-1 border-b border-slate-800 px-4 py-4 text-left transition last:border-b-0 hover:bg-slate-900"
                >
                  <span className="text-sm font-medium text-white">
                    {location.name}
                  </span>

                  <span className="text-xs leading-5 text-slate-500">
                    {
                      location.formattedAddress
                    }
                  </span>
                </button>
              ),
            )}
          </div>
        )}
      </div>

      <div className="mt-8 border-t border-slate-800 pt-8">
        <p className="text-sm font-medium text-slate-200">
          Location details
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Coordinates and timezone are filled
          automatically when possible.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Latitude
            </span>

            <input
              type="number"
              step="any"
              value={latitude}
              onChange={(event) =>
                onLocationChange(
                  event.target.value,
                  longitude,
                  timezone,
                )
              }
              placeholder="32.7767"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">
              Longitude
            </span>

            <input
              type="number"
              step="any"
              value={longitude}
              onChange={(event) =>
                onLocationChange(
                  latitude,
                  event.target.value,
                  timezone,
                )
              }
              placeholder="-96.7970"
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </label>
        </div>

        <label className="mt-6 block">
          <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-200">
            Timezone

            {isResolvingTimezone && (
              <span className="text-xs font-normal text-slate-500">
                Resolving...
              </span>
            )}
          </span>

          <input
            value={timezone}
            onChange={(event) =>
              onLocationChange(
                latitude,
                longitude,
                event.target.value,
              )
            }
            placeholder="America/Chicago"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
          />
        </label>
      </div>
    </div>
  );
}
