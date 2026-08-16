import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Site } from "@/types/site";
import type { CreateSiteInput } from "@/types/site-inputs";

function toDatabaseSite(input: CreateSiteInput) {
  return {
      organization_id: input.organizationId,
          name: input.name,
              site_type: input.siteType ?? "warehouse",
                  latitude: input.latitude,
                      longitude: input.longitude,
                          timezone: input.timezone,
                              operating_start: input.operatingStart,
                                  operating_end: input.operatingEnd,
                                    };
                                    }

                                    export async function createSite(
                                      input: CreateSiteInput
                                      ): Promise<Site> {
                                        const supabase =
                                            await createSupabaseServerClient();

                                              const { data, error } = await supabase
                                                  .from("sites")
                                                      .insert(toDatabaseSite(input))
                                                          .select()
                                                              .single();

                                                                if (error) {
                                                                    throw new Error(
                                                                          `Failed to create site: ${error.message}`
                                                                              );
                                                                                }

                                                                                  return data as Site;
                                                                                  }

                                                                                  export async function getSite(
                                                                                    siteId: string
                                                                                    ): Promise<Site> {
                                                                                      const supabase =
                                                                                          await createSupabaseServerClient();

                                                                                            const { data, error } = await supabase
                                                                                                .from("sites")
                                                                                                    .select("*")
                                                                                                        .eq("id", siteId)
                                                                                                            .single();

                                                                                                              if (error) {
                                                                                                                  throw new Error(
                                                                                                                        `Failed to fetch site: ${error.message}`
                                                                                                                            );
                                                                                                                              }

                                                                                                                                return data as Site;
                                                                                                                                }

                                                                                                                                export async function listSites(
                                                                                                                                  organizationId: string
                                                                                                                                  ): Promise<Site[]> {
                                                                                                                                    const supabase =
                                                                                                                                        await createSupabaseServerClient();

                                                                                                                                          const { data, error } = await supabase
                                                                                                                                              .from("sites")
                                                                                                                                                  .select("*")
                                                                                                                                                      .eq("organization_id", organizationId)
                                                                                                                                                          .order("created_at", {
                                                                                                                                                                ascending: true,
                                                                                                                                                                    });

                                                                                                                                                                      if (error) {
                                                                                                                                                                          throw new Error(
                                                                                                                                                                                `Failed to fetch sites: ${error.message}`
                                                                                                                                                                                    );
                                                                                                                                                                                      }

                                                                                                                                                                                        return (data ?? []) as Site[];
                                                                                                                                                                                        }