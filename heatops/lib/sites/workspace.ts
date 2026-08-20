import {
  createOrganization,
  getOrganization,
  getOrganizationByName,
} from "./organization-repository";

import type {
  Organization,
} from "@/types/site";

const WORKSPACE_STORAGE_KEY =
  "heatops:workspace-id";

const DEFAULT_WORKSPACE_NAME =
  "HeatOps Workspace";

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

export async function resolveWorkspace(): Promise<Organization> {
  const storedWorkspaceId =
    getStoredWorkspaceId();

  if (storedWorkspaceId) {
    const existingWorkspace =
      await getOrganization(
        storedWorkspaceId,
      );

    if (existingWorkspace) {
      return existingWorkspace;
    }

    clearStoredWorkspaceId();
  }

  const existingWorkspace =
    await getOrganizationByName(
      DEFAULT_WORKSPACE_NAME,
    );

  if (existingWorkspace) {
    setStoredWorkspaceId(
      existingWorkspace.id,
    );

    return existingWorkspace;
  }

  const createdWorkspace =
    await createOrganization({
      name:
        DEFAULT_WORKSPACE_NAME,
    });

  setStoredWorkspaceId(
    createdWorkspace.id,
  );

  return createdWorkspace;
}
