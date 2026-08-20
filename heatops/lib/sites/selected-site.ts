const SELECTED_SITE_STORAGE_KEY =
  "heatops:selected-site-id";

export function getSelectedSiteId():
  | string
  | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return (
    window.localStorage.getItem(
      SELECTED_SITE_STORAGE_KEY,
    ) ?? null
  );
}

export function setSelectedSiteId(
  siteId: string,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    SELECTED_SITE_STORAGE_KEY,
    siteId,
  );
}

export function clearSelectedSiteId(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    SELECTED_SITE_STORAGE_KEY,
  );
}
