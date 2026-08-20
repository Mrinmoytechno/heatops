import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  Site,
} from "@/types/site";

import type {
  CreateSiteInput,
  UpdateSiteInput,
} from "@/types/site-inputs";

function toDatabaseSite(
  input: CreateSiteInput,
) {
  return {
    organization_id:
      input.organizationId,

    name:
      input.name,

    site_type:
      input.siteType ??
      "warehouse",

    latitude:
      input.latitude,

    longitude:
      input.longitude,

    timezone:
      input.timezone,

    operating_start:
      input.operatingStart,

    operating_end:
      input.operatingEnd,
  };
}

function toDatabaseSiteUpdate(
  input: UpdateSiteInput,
) {
  return {
    ...(input.name !== undefined
      ? {
          name:
            input.name,
        }
      : {}),

    ...(input.siteType !== undefined
      ? {
          site_type:
            input.siteType,
        }
      : {}),

    ...(input.latitude !== undefined
      ? {
          latitude:
            input.latitude,
        }
      : {}),

    ...(input.longitude !== undefined
      ? {
          longitude:
            input.longitude,
        }
      : {}),

    ...(input.timezone !== undefined
      ? {
          timezone:
            input.timezone,
        }
      : {}),

    ...(input.operatingStart !== undefined
      ? {
          operating_start:
            input.operatingStart,
        }
      : {}),

    ...(input.operatingEnd !== undefined
      ? {
          operating_end:
            input.operatingEnd,
        }
      : {}),

    updated_at:
      new Date().toISOString(),
  };
}

export async function createSite(
  input: CreateSiteInput,
): Promise<Site> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("sites")
    .insert(
      toDatabaseSite(input),
    )
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create site: ${error.message}`,
    );
  }

  return data as Site;
}

export async function getSite(
  siteId: string,
): Promise<Site> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .single();

  if (error) {
    throw new Error(
      `Failed to fetch site: ${error.message}`,
    );
  }

  return data as Site;
}

export async function listSites(
  organizationId: string,
): Promise<Site[]> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("sites")
    .select("*")
    .eq(
      "organization_id",
      organizationId,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      `Failed to fetch sites: ${error.message}`,
    );
  }

  return (
    data ?? []
  ) as Site[];
}

export async function updateSite(
  siteId: string,
  input: UpdateSiteInput,
): Promise<Site> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("sites")
    .update(
      toDatabaseSiteUpdate(input),
    )
    .eq("id", siteId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update site: ${error.message}`,
    );
  }

  return data as Site;
}

export async function deleteSite(
  siteId: string,
): Promise<void> {
  const supabase =
    await createSupabaseServerClient();

  const {
    error,
  } = await supabase
    .from("sites")
    .delete()
    .eq("id", siteId);

  if (error) {
    throw new Error(
      `Failed to delete site: ${error.message}`,
    );
  }
}
