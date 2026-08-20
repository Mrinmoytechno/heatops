import { createSupabaseServerClient } from "@/lib/supabase/server";

import type {
  Organization,
} from "@/types/site";

import type {
  CreateOrganizationInput,
} from "@/types/site-inputs";

export async function createOrganization(
  input: CreateOrganizationInput,
): Promise<Organization> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("organizations")
    .insert({
      name: input.name,
    })
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to create organization: ${error.message}`,
    );
  }

  return data as Organization;
}

export async function getOrganization(
  organizationId: string,
): Promise<Organization | null> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("organizations")
    .select("*")
    .eq(
      "id",
      organizationId,
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch organization: ${error.message}`,
    );
  }

  return (
    data as Organization | null
  );
}

export async function getOrganizationByName(
  name: string,
): Promise<Organization | null> {
  const supabase =
    await createSupabaseServerClient();

  const {
    data,
    error,
  } = await supabase
    .from("organizations")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (error) {
    throw new Error(
      `Failed to fetch organization: ${error.message}`,
    );
  }

  return (
    data as Organization | null
  );
    }
