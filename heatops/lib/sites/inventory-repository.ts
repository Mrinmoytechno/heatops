import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InventoryProfile } from "@/types/site";
import type { CreateInventoryProfileInput } from "@/types/site-inputs";

export async function createInventoryProfile(
  input: CreateInventoryProfileInput
  ): Promise<InventoryProfile> {
    const supabase =
        await createSupabaseServerClient();

          const { data, error } = await supabase
              .from("inventory_profiles")
                  .insert({
                        site_id: input.siteId,
                              zone_id: input.zoneId ?? null,
                                    name: input.name,
                                          temperature_sensitivity:
                                                  input.temperatureSensitivity ?? 0.5,
                                                        description: input.description ?? null,
                                                            })
                                                                .select()
                                                                    .single();

                                                                      if (error) {
                                                                          throw new Error(
                                                                                `Failed to create inventory profile: ${error.message}`
                                                                                    );
                                                                                      }

                                                                                        return data as InventoryProfile;
                                                                                        }

                                                                                        export async function listInventoryProfiles(
                                                                                          siteId: string
                                                                                          ): Promise<InventoryProfile[]> {
                                                                                            const supabase =
                                                                                                await createSupabaseServerClient();

                                                                                                  const { data, error } = await supabase
                                                                                                      .from("inventory_profiles")
                                                                                                          .select("*")
                                                                                                              .eq("site_id", siteId)
                                                                                                                  .order("created_at", {
                                                                                                                        ascending: true,
                                                                                                                            });

                                                                                                                              if (error) {
                                                                                                                                  throw new Error(
                                                                                                                                        `Failed to fetch inventory profiles: ${error.message}`
                                                                                                                                            );
                                                                                                                                              }

                                                                                                                                                return (data ?? []) as InventoryProfile[];
                                                                                                                                                }