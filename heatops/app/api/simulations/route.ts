import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  runSimulation,
} from "@/lib/simulation";

import {
  generateSimulationNotification,
} from "@/lib/notifications";

const timeSchema = z
  .string()
  .regex(
    /^\d{2}:\d{2}$/,
    "Time must use HH:MM format.",
  );

const scheduleSchema = z.object({
  start: timeSchema,

  end: timeSchema,
});

const forecastRequestSchema = z.object({
  latitude: z.number(),

  longitude: z.number(),

  startDate: z.string(),

  endDate: z.string(),

  startTime: timeSchema.optional(),

  endTime: timeSchema.optional(),

  filterType: z.string().optional(),
});

const impactInputSchema = z.object({
  operationId: z.string().uuid(),

  siteId: z.string().uuid(),

  operationType: z.string(),

  scheduledStart: timeSchema,

  scheduledEnd: timeSchema,

  workforceCount: z
    .number()
    .min(0),

  laborCostPerHour: z
    .number()
    .min(0),

  disruptionCostPerHour: z
    .number()
    .min(0),

  inventoryValueAtRisk: z
    .number()
    .min(0)
    .optional(),

  inventorySensitivity: z
    .number()
    .min(0)
    .max(1)
    .optional(),

  operationalPriority: z
    .number()
    .min(0)
    .max(1)
    .optional(),
}).passthrough();

const operationSchema = z.object({
  scheduledStart: timeSchema,

  scheduledEnd: timeSchema,

  operationalPriority: z
    .number()
    .min(0)
    .max(1)
    .nullable()
    .optional(),

  workforceCount: z
    .number()
    .min(0)
    .optional(),
});

const decisionConstraintsSchema =
  z.object({
    allowEarlierMove: z
      .boolean()
      .optional(),

    allowLaterMove: z
      .boolean()
      .optional(),

    allowSplit: z
      .boolean()
      .optional(),

    allowPrioritization: z
      .boolean()
      .optional(),

    earliestStart: timeSchema
      .nullable()
      .optional(),

    latestEnd: timeSchema
      .nullable()
      .optional(),
  });

const operationAnalysisInputSchema =
  z.object({
    forecastRequest:
      forecastRequestSchema,

    impactInput:
      impactInputSchema,

    operation:
      operationSchema,

    decisionConstraints:
      decisionConstraintsSchema
        .optional(),
  });

const decisionSchema = z.object({
  risk: z.object({
    score: z
      .number()
      .min(0)
      .max(100),
  }),

  recommendation: z.object({
    action: z.string().min(1),

    reason: z.string(),

    schedule: scheduleSchema
      .nullable()
      .optional(),
  }),

  projectedRisk: z
    .object({
      score: z
        .number()
        .min(0)
        .max(100),
    })
    .nullable()
    .optional(),
}).passthrough();

const operatingPlanItemSchema =
  z.object({
    operationId:
      z.string().uuid(),

    operationName:
      z.string().min(1),

    zoneName: z
      .string()
      .nullable()
      .optional(),

    priority: z.enum([
      "critical",
      "high",
      "medium",
      "low",
    ]),

    status: z.enum([
      "action_required",
      "recommended",
      "monitor",
      "no_change",
    ]),

    currentSchedule:
      scheduleSchema,

    recommendedSchedule:
      scheduleSchema
        .nullable()
        .optional(),

    decision:
      decisionSchema,

    summary: z.string(),

    reason: z.string(),

    riskBefore: z
      .number()
      .min(0)
      .max(100),

    projectedRiskAfter: z
      .number()
      .min(0)
      .max(100)
      .nullable(),

    createdAt: z.string(),
  });

const operatingPlanSchema = z.object({
  siteId:
    z.string().uuid(),

  analysisTime:
    z.string().datetime(),

  title: z.string(),

  summary: z.string(),

  items: z
    .array(
      operatingPlanItemSchema,
    )
    .min(1),

  totalOperationsAnalyzed: z
    .number()
    .int()
    .min(0),

  actionsRequired: z
    .number()
    .int()
    .min(0),

  recommendations: z
    .number()
    .int()
    .min(0),

  monitoringItems: z
    .number()
    .int()
    .min(0),

  generatedAt:
    z.string().datetime(),
});

const changeSchema =
  z.discriminatedUnion(
    "type",
    [
      z.object({
        operationId:
          z.string().uuid(),

        type:
          z.literal(
            "move_earlier",
          ),

        minutes: z
          .number()
          .int()
          .positive(),
      }),

      z.object({
        operationId:
          z.string().uuid(),

        type:
          z.literal(
            "move_later",
          ),

        minutes: z
          .number()
          .int()
          .positive(),
      }),

      z.object({
        operationId:
          z.string().uuid(),

        type:
          z.literal(
            "set_schedule",
          ),

        start: timeSchema,

        end: timeSchema,
      }),

      z.object({
        operationId:
          z.string().uuid(),

        type: z.literal(
          "apply_recommendation",
        ),
      }),

      z.object({
        operationId:
          z.string().uuid(),

        type:
          z.literal("maintain"),
      }),
    ],
  );

const operationContextSchema =
  z.object({
    operationId:
      z.string().uuid(),

    analysisInput:
      operationAnalysisInputSchema,
  });

const requestSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100),

  description: z
    .string()
    .max(500)
    .nullable()
    .optional(),

  operatingPlan:
    operatingPlanSchema,

  changes: z
    .array(changeSchema)
    .min(1),

  operationContexts: z
    .array(
      operationContextSchema,
    )
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

    const planOperationIds =
      new Set(
        validatedInput
          .operatingPlan.items
          .map(
            (item) =>
              item.operationId,
          ),
      );

    const contextOperationIds =
      new Set(
        validatedInput
          .operationContexts
          .map(
            (context) =>
              context.operationId,
          ),
      );

    for (
      const operationId of
        planOperationIds
    ) {
      if (
        !contextOperationIds.has(
          operationId,
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "MISSING_OPERATION_CONTEXT",

            message:
              `Missing simulation context for operation ${operationId}.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    for (
      const change of
        validatedInput.changes
    ) {
      if (
        !planOperationIds.has(
          change.operationId,
        )
      ) {
        return NextResponse.json(
          {
            success: false,

            error:
              "INVALID_OPERATION_CHANGE",

            message:
              `Operation ${change.operationId} does not belong to the submitted operating plan.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    const simulation =
      await runSimulation(
        validatedInput,
      );

    const notificationResult =
      generateSimulationNotification({
        siteId:
          validatedInput
            .operatingPlan
            .siteId,

        simulationId:
          simulation.scenarioId,

        name:
          simulation.name,

        riskBefore:
          simulation
            .comparison
            .baselineRisk,

        riskAfter:
          simulation
            .comparison
            .scenarioRisk,

        modeledImpact: null,
      });

    return NextResponse.json(
      {
        success: true,

        data: {
          simulation,

          notifications:
            notificationResult,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return NextResponse.json(
        {
          success: false,

          error:
            "INVALID_SIMULATION_INPUT",

          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Simulation failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "SIMULATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
  }
