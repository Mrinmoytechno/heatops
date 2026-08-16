export type Organization = {
      id: string;
        name: string;
          created_at: string;
          };

          export type Site = {
            id: string;
              organization_id: string;
                name: string;
                  site_type: string;
                    latitude: number;
                      longitude: number;
                        timezone: string;
                          operating_start: string;
                            operating_end: string;
                              created_at: string;
                                updated_at: string;
                                };

                                export type Zone = {
                                  id: string;
                                    site_id: string;
                                      name: string;
                                        zone_type: string;
                                          temperature_sensitivity: number;
                                            operational_priority: number;
                                              latitude: number | null;
                                                longitude: number | null;
                                                  created_at: string;
                                                    updated_at: string;
                                                    };

                                                    export type Operation = {
                                                      id: string;
                                                        site_id: string;
                                                          zone_id: string | null;
                                                            name: string;
                                                              operation_type: string;
                                                                scheduled_start: string;
                                                                  scheduled_end: string;
                                                                    workforce_count: number;
                                                                      operational_priority: number;
                                                                        created_at: string;
                                                                          updated_at: string;
                                                                          };

                                                                          export type InventoryProfile = {
                                                                            id: string;
                                                                              site_id: string;
                                                                                zone_id: string | null;
                                                                                  name: string;
                                                                                    temperature_sensitivity: number;
                                                                                      description: string | null;
                                                                                        created_at: string;
                                                                                          updated_at: string;
                                                                                          };

                                                                                          export type WorkforceProfile = {
                                                                                            id: string;
                                                                                              site_id: string;
                                                                                                zone_id: string | null;
                                                                                                  name: string;
                                                                                                    worker_count: number;
                                                                                                      activity_type: string | null;
                                                                                                        created_at: string;
                                                                                                          updated_at: string;
                                                                                                          };