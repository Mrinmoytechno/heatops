import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Operation } from "@/types/site";
import type { CreateOperationInput } from "@/types/site-inputs";

export async function createOperation(
  input: CreateOperationInput
  ): Promise<Operation> {
    const supabase =
        await createSupabaseServerClient();

          const { data, error } = await supabase
              .from("operations")
                  .insert({
                        site_id: input.siteId,
                              zone_id: input.zoneId ?? null,
                                    name: input.name,
                                          operation_type: input.operationType,
                                                scheduled_start: input.scheduledStart,
                                                      scheduled_end: input.scheduledEnd,
                                                            workforce_count:
                                                                    input.workforceCount ?? 0,
                                                                          operational_priority:
                                                                                  input.operationalPriority ?? 0.5,
                                                                                      })
                                                                                          .select()
                                                                                              .single();

                                                                                                if (error) {
                                                                                                    throw new Error(
                                                                                                          `Failed to create operation: ${error.message}`
                                                                                                              );
                                                                                                                }

                                                                                                                  return data as Operation;
                                                                                                                  }

                                                                                                                  export async function listOperations(
                                                                                                                    siteId: string
                                                                                                                    ): Promise<Operation[]> {
                                                                                                                      const supabase =
                                                                                                                          await createSupabaseServerClient();

                                                                                                                            const { data, error } = await supabase
                                                                                                                                .from("operations")
                                                                                                                                    .select("*")
                                                                                                                                        .eq("site_id", siteId)
                                                                                                                                            .order("scheduled_start", {
                                                                                                                                                  ascending: true,
                                                                                                                                                      });

                                                                                                                                                        if (error) {
                                                                                                                                                            throw new Error(
                                                                                                                                                                  `Failed to fetch operations: ${error.message}`
                                                                                                                                                                      );
                                                                                                                                                                        }

                                                                                                                                                                          return (data ?? []) as Operation[];
                                                                                                                                                                          }