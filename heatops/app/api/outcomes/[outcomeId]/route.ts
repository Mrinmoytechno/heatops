import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  getOutcomeById,
  recordActualOutcome,
  updateOutcome,
} from "@/lib/outcomes";

const metricSchema = z.object({
  key: z.string().min(1).max(100),

  label: z.string().min(1).max(200),

  value: z.number(),

  unit: z.string().min(1).max(50),

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

const requestSchema = z.object({
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

    const existingOutcome =
      await getOutcomeById(
        outcomeId,
      );

    if (!existingOutcome) {
      return NextResponse.json(
        {
          success: false,

          error:
            "OUTCOME_NOT_FOUND",
        },
        {
          status: 404,
        },
      );
    }

    const updatedOutcome =
      recordActualOutcome(
        existingOutcome,
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

    const savedOutcome =
      await updateOutcome(
        updatedOutcome,
      );

    return NextResponse.json(
      {
        success: true,

        data: {
          outcome:
            savedOutcome,
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
