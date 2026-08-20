export type CreateOrganizationInput = {
  name: string;
};

export type CreateSiteInput = {
  organizationId: string;

  name: string;

  siteType?: string;

  latitude: number;

  longitude: number;

  timezone: string;

  operatingStart: string;

  operatingEnd: string;
};

export type UpdateSiteInput = {
  name?: string;

  siteType?: string;

  latitude?: number;

  longitude?: number;

  timezone?: string;

  operatingStart?: string;

  operatingEnd?: string;
};

export type CreateZoneInput = {
  siteId: string;

  name: string;

  zoneType: string;

  temperatureSensitivity?: number;

  operationalPriority?: number;

  latitude?: number | null;

  longitude?: number | null;
};

export type CreateOperationInput = {
  siteId: string;

  zoneId?: string | null;

  name: string;

  operationType: string;

  scheduledStart: string;

  scheduledEnd: string;

  workforceCount?: number;

  operationalPriority?: number;
};

export type CreateInventoryProfileInput = {
  siteId: string;

  zoneId?: string | null;

  name: string;

  temperatureSensitivity?: number;

  description?: string | null;
};

export type CreateWorkforceProfileInput = {
  siteId: string;

  zoneId?: string | null;

  name: string;

  workerCount?: number;

  activityType?: string | null;
};
