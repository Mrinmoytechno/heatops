import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .optional()
    .or(z.literal("")),

  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .optional()
    .or(z.literal("")),

  THERMAL_PROVIDER: z.enum([
    "development",
    "fortyguard",
  ]),

  FORTYGUARD_BASE_URL: z
  .string()
  .url()
  .optional()
  .or(z.literal("")),
  
  FORTYGUARD_API_BASE_URL: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),

  FORTYGUARD_API_KEY: z
    .string()
    .optional()
    .or(z.literal("")),

  FORTYGUARD_POLL_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(5000),

  FORTYGUARD_MAX_POLL_ATTEMPTS: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(24),

  HEATOPS_REFERENCE_TEMPERATURE_F: z.coerce
    .number()
    .optional(),

  HEATOPS_ELEVATED_TEMPERATURE_F: z.coerce
    .number()
    .optional(),

  HEATOPS_HIGH_TEMPERATURE_F: z.coerce
    .number()
    .optional(),

  HEATOPS_CRITICAL_TEMPERATURE_F: z.coerce
    .number()
    .optional(),

  AI_PROVIDER: z
    .string()
    .optional()
    .or(z.literal("")),

  AI_API_KEY: z
    .string()
    .optional()
    .or(z.literal("")),

  AI_MODEL: z
    .string()
    .optional()
    .or(z.literal("")),
});

export function getEnvironment() {
  return environmentSchema.parse({
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL,

    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL,

    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,

    SUPABASE_SERVICE_ROLE_KEY:
      process.env.SUPABASE_SERVICE_ROLE_KEY,

    THERMAL_PROVIDER:
      process.env.THERMAL_PROVIDER ??
      "development",

    FORTYGUARD_BASE_URL:
  process.env.FORTYGUARD_BASE_URL,

    FORTYGUARD_API_BASE_URL:
      process.env.FORTYGUARD_API_BASE_URL,

    FORTYGUARD_API_KEY:
      process.env.FORTYGUARD_API_KEY,

    FORTYGUARD_POLL_INTERVAL_MS:
      process.env.FORTYGUARD_POLL_INTERVAL_MS,

    FORTYGUARD_MAX_POLL_ATTEMPTS:
      process.env.FORTYGUARD_MAX_POLL_ATTEMPTS,

    HEATOPS_REFERENCE_TEMPERATURE_F:
      process.env.HEATOPS_REFERENCE_TEMPERATURE_F,

    HEATOPS_ELEVATED_TEMPERATURE_F:
      process.env.HEATOPS_ELEVATED_TEMPERATURE_F,

    HEATOPS_HIGH_TEMPERATURE_F:
      process.env.HEATOPS_HIGH_TEMPERATURE_F,

    HEATOPS_CRITICAL_TEMPERATURE_F:
      process.env.HEATOPS_CRITICAL_TEMPERATURE_F,

    AI_PROVIDER:
      process.env.AI_PROVIDER,

    AI_API_KEY:
      process.env.AI_API_KEY,

    AI_MODEL:
      process.env.AI_MODEL,
  });
}
