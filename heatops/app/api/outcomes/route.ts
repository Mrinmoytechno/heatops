import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  createManagerDecision,
  createOutcomeRecord,
  saveManagerDecision,
  saveOutcome,
} from "@/lib/outcomes";

const modeledMetricSchema = z.object({
  key: z.string().min(1).max(100),

  label: z.string().min(1).max(200),

  value: z.number(),

  unit: z.string().min(1).max(50),

  source: z.literal("modeled"),

  assumptions: z
    .array(
      z.string().min(1).max(500),
    )
    .optional(),

  calculatedAt: z
    .string()
    .datetime(),
});

const decisionSchema = z.object({
  status: z.enum([
    "accepted",
    "modified",
    "rejected",
    "pending",
  ]),

  originalRecommendation: z
    .string()
    .min(1)
    .max(2000),

  modifiedAction: z
    .string()
    .max(2000)
    .nullable()
    .optional(),

  notes: z
    .string()
    .max(2000)
    .nullable()
    .optional(),

  decidedAt: z
    .string()
    .datetime()
    .optional(),
});

const requestSchema = z.object({
  siteId: z.string().uuid(),

  recommendationId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  operationId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  decision: decisionSchema
    .nullable()
    .optional(),

  modeledMetrics: z
    .array(modeledMetricSchema)
    .optional(),

  status: z
    .enum([
      "pending",
      "in_progress",
      "completed",
      "unavailable",
    ])
    .optional(),
});

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const input =
      requestSchema.parse(body);

    let savedDecision = null;

    if (input.decision) {
      const decision =
        createManagerDecision({
          siteId: input.siteId,

          recommendationId:
            input.recommendationId ??
            null,

          operationId:
            input.operationId ??
            null,

          status:
            input.decision.status,

          originalRecommendation:
            input.decision
              .originalRecommendation,

          modifiedAction:
            input.decision
              .modifiedAction ??
            null,

          notes:
            input.decision.notes ??
            null,

          decidedAt:
            input.decision.decidedAt,
        });

      savedDecision =
        await saveManagerDecision(
          decision,
        );
    }

    const outcome =
      createOutcomeRecord({
        siteId: input.siteId,

        recommendationId:
          input.recommendationId ??
          null,

        operationId:
          input.operationId ??
          null,

        decisionId:
          savedDecision?.id ?? null,

        modeledMetrics:
          input.modeledMetrics ?? [],

        status:
          input.status ??
          "pending",
      });

    const savedOutcome =
      await saveOutcome(outcome);

    return NextResponse.json(
      {
        success: true,

        data: {
          decision:
            savedDecision,

          outcome:
            savedOutcome,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,

          error:
            "INVALID_OUTCOME_INPUT",

          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to create outcome:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "OUTCOME_CREATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
      }
