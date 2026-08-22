import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  createOperatingPlan,
} from "@/lib/operating-plan";

import {
  generateOperatingPlanNotifications,
} from "@/lib/notifications";

import type {
  DecisionRecommendation,
} from "@/types/decision";

const decisionSchema = z.object({
  operationId: z.string().min(1),

  zoneId: z
    .string()
    .nullable(),

  priority: z.enum([
    "low",
    "medium",
    "high",
    "critical",
  ]),

  recommendedAction: z.object({
    actionType: z.enum([
      "maintain",
      "move_earlier",
      "move_later",
      "split_operation",
      "prioritize",
      "reduce_exposure",
    ]),

    label: z.string(),

    description: z.string(),

    proposedStartTime: z
      .string()
      .nullable(),

    proposedEndTime: z
      .string()
      .nullable(),

    tradeOff: z.object({
      riskScore: z.number(),

      disruptionScore:
        z.number(),

      modeledCost:
        z.number(),

      overallScore:
        z.number(),
    }),

    reasons:
      z.array(z.string()),
  }),

  alternatives: z.array(
    z.object({
      actionType: z.enum([
        "maintain",
        "move_earlier",
        "move_later",
        "split_operation",
        "prioritize",
        "reduce_exposure",
      ]),

      label: z.string(),

      description: z.string(),

      proposedStartTime:
        z.string().nullable(),

      proposedEndTime:
        z.string().nullable(),

      tradeOff: z.object({
        riskScore:
          z.number(),

        disruptionScore:
          z.number(),

        modeledCost:
          z.number(),

        overallScore:
          z.number(),
      }),

      reasons:
        z.array(z.string()),
    }),
  ),

  impact: z.unknown(),

  risk: z.unknown(),

  reasons:
    z.array(z.string()),

  assumptions:
    z.array(z.string()),
});

const operationSchema = z.object({
  operationId: z.string().uuid(),

  operationName: z.string().min(1),

  zoneName: z
    .string()
    .nullable()
    .optional(),

  scheduledStart:
    z.string().min(1),

  scheduledEnd:
    z.string().min(1),

  decision: decisionSchema,
});

const requestSchema = z.object({
  siteId: z.string().uuid(),

  analysisTime:
    z.string().datetime(),

  operations:
    z.array(operationSchema)
      .min(1),
});

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const validatedInput =
      requestSchema.parse(body);

    const operatingPlan =
      createOperatingPlan({
        siteId:
          validatedInput.siteId,

        analysisTime:
          validatedInput.analysisTime,

        operations:
          validatedInput.operations.map(
            (operation) => ({
              siteId:
                validatedInput.siteId,

              operationId:
                operation.operationId,

              operationName:
                operation.operationName,

              zoneName:
                operation.zoneName,

              scheduledStart:
                operation.scheduledStart,

              scheduledEnd:
                operation.scheduledEnd,

              decision:
                operation.decision as DecisionRecommendation,
            }),
          ),
      });

    const notificationResult =
      generateOperatingPlanNotifications({
        siteId:
          operatingPlan.siteId,

        actionsRequired:
          operatingPlan.actionsRequired,

        recommendations:
          operatingPlan.recommendations,

        monitoringItems:
          operatingPlan.monitoringItems,

        title:
          operatingPlan.title,
      });

    return NextResponse.json(
      {
        success: true,

        data: {
          operatingPlan,

          notifications:
            notificationResult,
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
            "INVALID_OPERATING_PLAN_INPUT",

          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to create operating plan:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "OPERATING_PLAN_GENERATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}