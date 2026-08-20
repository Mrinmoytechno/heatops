import {
  createOrganization,
  getOrganizationByName,
} from "./organization-repository";

import type {
  Organization,
} from "@/types/site";

const DEFAULT_WORKSPACE_NAME =
  "HeatOps Workspace";

export async function resolveWorkspace(): Promise<Organization> {
  const existingWorkspace =
    await getOrganizationByName(
      DEFAULT_WORKSPACE_NAME,
    );

  if (existingWorkspace) {
    return existingWorkspace;
  }

  return createOrganization({
    name:
      DEFAULT_WORKSPACE_NAME,
  });
}
