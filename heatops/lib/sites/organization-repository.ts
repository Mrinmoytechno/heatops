import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Organization } from "@/types/site";
import type { CreateOrganizationInput } from "@/types/site-inputs";

export async function createOrganization(
  input: CreateOrganizationInput
  ): Promise<Organization> {
    const supabase =
        await createSupabaseServerClient();

          const { data, error } = await supabase
              .from("organizations")
                  .insert({
                        name: input.name,
                            })
                                .select()
                                    .single();

                                      if (error) {
                                          throw new Error(
                                                `Failed to create organization: ${error.message}`
                                                    );
                                                      }

                                                        return data as Organization;
                                                        }