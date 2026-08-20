const WORKSPACE_STORAGE_KEY =
  "heatops:workspace-id";

export function getStoredWorkspaceId():
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
      WORKSPACE_STORAGE_KEY,
    ) ?? null
  );
}

export function setStoredWorkspaceId(
  workspaceId: string,
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    WORKSPACE_STORAGE_KEY,
    workspaceId,
  );
}

export function clearStoredWorkspaceId(): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    WORKSPACE_STORAGE_KEY,
  );
}
