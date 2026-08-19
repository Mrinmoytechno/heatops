import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  OutcomeRecord,
  recordActualOutcome,
} from "@/lib/outcomes";

const metricSchema = z.object({
  key: z
    .string()
    .min(1)
    .max(100),

  label: z
    .string()
    .min(1)
    .max(200),

  value: z.number(),

  unit: z
    .string()
    .min(1)
    .max(50),

  source: z.enum([
    "observed",
    "calculated",
    "actual",
  ]),

  recordedAt: z
    .string()
    .datetime(),

  notes: z
    .string()
    .max(1000)
    .nullable()
    .optional(),
});

const outcomeSchema = z.object({
  id: z.string().uuid(),

  siteId: z.string().uuid(),

  recommendationId: z
    .string()
    .uuid()
    .nullable(),

  operationId: z
    .string()
    .uuid()
    .nullable(),

  decisionId: z
    .string()
    .uuid()
    .nullable(),

  status: z.enum([
    "pending",
    "in_progress",
    "completed",
    "unavailable",
  ]),

  modeledMetrics: z.array(
    z.object({
      key: z.string(),

      label: z.string(),

      value: z.number(),

      unit: z.string(),

      source: z.literal("modeled"),

      assumptions: z
        .array(z.string())
        .optional(),

      calculatedAt: z
        .string()
        .datetime(),
    }),
  ),

  actualMetrics: z.array(
    metricSchema,
  ),

  comparisons: z.array(
    z.object({
      key: z.string(),

      label: z.string(),

      unit: z.string(),

      modeledValue:
        z.number().nullable(),

      actualValue:
        z.number().nullable(),

      difference:
        z.number().nullable(),

      differencePercent:
        z.number().nullable(),
    }),
  ),

  createdAt: z
    .string()
    .datetime(),

  updatedAt: z
    .string()
    .datetime(),

  completedAt: z
    .string()
    .datetime()
    .nullable(),
});

const requestSchema = z.object({
  outcome: outcomeSchema,

  metrics: z
    .array(metricSchema)
    .min(1),

  status: z
    .enum([
      "pending",
      "in_progress",
      "completed",
      "unavailable",
    ])
    .optional(),

  completedAt: z
    .string()
    .datetime()
    .nullable()
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      outcomeId: string;
    }>;
  },
) {
  try {
    const { outcomeId } =
      await context.params;

    const body =
      await request.json();

    const input =
      requestSchema.parse(body);

    if (
      input.outcome.id !==
      outcomeId
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "OUTCOME_ID_MISMATCH",
        },
        {
          status: 400,
        },
      );
    }

    const updatedOutcome =
      recordActualOutcome(
        input.outcome as OutcomeRecord,
        {
          outcomeId,

          metrics:
            input.metrics,

          status:
            input.status,

          completedAt:
            input.completedAt,
        },
      );

    return NextResponse.json(
      {
        success: true,

        data: {
          outcome:
            updatedOutcome,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,

          error:
            "INVALID_ACTUAL_OUTCOME",

          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    if (
      error instanceof Error &&
      error.message ===
        "OUTCOME_ID_MISMATCH"
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "OUTCOME_ID_MISMATCH",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to record actual outcome:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "OUTCOME_RECORDING_FAILED",
      },
      {
        status: 500,
      },
    );
  }
  }
