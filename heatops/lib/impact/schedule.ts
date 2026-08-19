export function timeToMinutes(
  value: string
): number {
  const [hours, minutes] =
    value.split(":").map(Number);

  return (
    hours * 60 +
    minutes
  );
}

export function calculateExposureHours(
  scheduledStart: string,
  scheduledEnd: string,
  observationTimes: string[]
): number {
  const start =
    timeToMinutes(
      scheduledStart
    );

  const end =
    timeToMinutes(
      scheduledEnd
    );

  if (end <= start) {
    return 0;
  }

  const overlapping =
    observationTimes.filter(
      (timestamp) => {
        const date =
          new Date(timestamp);

        const minutes =
          date.getHours() * 60 +
          date.getMinutes();

        return (
          minutes >= start &&
          minutes < end
        );
      }
    );

  if (
    overlapping.length === 0
  ) {
    return 0;
  }

  /*
   * Observations are hourly in our
   * current thermal workflow.
   *
   * Each overlapping observation
   * represents one hour of exposure.
   */
  return overlapping.length;
}
