import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Zone } from "@/types/site";
import type { CreateZoneInput } from "@/types/site-inputs";

export async function createZone(
  input: CreateZoneInput
  ): Promise<Zone> {
    const supabase =
        await createSupabaseServerClient();

          const { data, error } = await supabase
              .from("zones")
                  .insert({
                        site_id: input.siteId,
                              name: input.name,
                                    zone_type: input.zoneType,
                                          temperature_sensitivity:
                                                  input.temperatureSensitivity ?? 0.5,
                                                        operational_priority:
                                                                input.operationalPriority ?? 0.5,
                                                                      latitude: input.latitude ?? null,
                                                                            longitude: input.longitude ?? null,
                                                                                })
                                                                                    .select()
                                                                                        .single();

                                                                                          if (error) {
                                                                                              throw new Error(
                                                                                                    `Failed to create zone: ${error.message}`
                                                                                                        );
                                                                                                          }

                                                                                                            return data as Zone;
                                                                                                            }

                                                                                                            export async function listZones(
                                                                                                              siteId: string
                                                                                                              ): Promise<Zone[]> {
                                                                                                                const supabase =
                                                                                                                    await createSupabaseServerClient();

                                                                                                                      const { data, error } = await supabase
                                                                                                                          .from("zones")
                                                                                                                              .select("*")
                                                                                                                                  .eq("site_id", siteId)
                                                                                                                                      .order("created_at", {
                                                                                                                                            ascending: true,
                                                                                                                                                });

                                                                                                                                                  if (error) {
                                                                                                                                                      throw new Error(
                                                                                                                                                            `Failed to fetch zones: ${error.message}`
                                                                                                                                                                );
                                                                                                                                                                  }

                                                                                                                                                                    return (data ?? []) as Zone[];
                                                                                                                                                                    }