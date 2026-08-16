import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { WorkforceProfile } from "@/types/site";
import type { CreateWorkforceProfileInput } from "@/types/site-inputs";

export async function createWorkforceProfile(
  input: CreateWorkforceProfileInput
  ): Promise<WorkforceProfile> {
    const supabase =
        await createSupabaseServerClient();

          const { data, error } = await supabase
              .from("workforce_profiles")
                  .insert({
                        site_id: input.siteId,
                              zone_id: input.zoneId ?? null,
                                    name: input.name,
                                          worker_count:
                                                  input.workerCount ?? 0,
                                                        activity_type:
                                                                input.activityType ?? null,
                                                                    })
                                                                        .select()
                                                                            .single();

                                                                              if (error) {
                                                                                  throw new Error(
                                                                                        `Failed to create workforce profile: ${error.message}`
                                                                                            );
                                                                                              }

                                                                                                return data as WorkforceProfile;
                                                                                                }

                                                                                                export async function listWorkforceProfiles(
                                                                                                  siteId: string
                                                                                                  ): Promise<WorkforceProfile[]> {
                                                                                                    const supabase =
                                                                                                        await createSupabaseServerClient();

                                                                                                          const { data, error } = await supabase
                                                                                                              .from("workforce_profiles")
                                                                                                                  .select("*")
                                                                                                                      .eq("site_id", siteId)
                                                                                                                          .order("created_at", {
                                                                                                                                ascending: true,
                                                                                                                                    });

                                                                                                                                      if (error) {
                                                                                                                                          throw new Error(
                                                                                                                                                `Failed to fetch workforce profiles: ${error.message}`
                                                                                                                                                    );
                                                                                                                                                      }

                                                                                                                                                        return (data ?? []) as WorkforceProfile[];
                                                                                                                                                        }