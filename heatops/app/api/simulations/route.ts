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

const polygonAoiSchema = z.object({
  type: z.literal("FeatureCollection"),

  features: z
    .array(
      z.object({
        type: z.literal("Feature"),

        properties: z.record(
          z.string(),
          z.unknown(),
        ),

        geometry: z.object({
          type: z.literal("Polygon"),

          coordinates: z.array(
            z.array(
              z.array(
                z.number(),
              ),
            ),
          ),
        }),
      }),
    )
    .min(1),
});

const forecastRequestSchema = z.object({
  siteId: z.string().uuid(),

  latitude: z.number(),

  longitude: z.number(),

  startTime: z.string().datetime(),

  endTime: z.string().datetime(),

  polygonAoi: polygonAoiSchema,
});

const impactAssumptionsSchema = z.object({
  referenceTemperatureF: z.number(),

  elevatedTemperatureF: z.number(),

  highTemperatureF: z.number(),

  criticalTemperatureF: z.number(),

  productivityLossPerHour: z
    .number()
    .min(0),

  laborCostPerHour: z
    .number()
    .min(0),

  inventoryExposureRatePerHour: z
    .number()
    .min(0),
});

const impactInputSchema = z.object({
  operation: z.object({
    id: z.string().uuid(),

    zoneId: z
      .string()
      .uuid()
      .nullable(),

    scheduledStart: timeSchema,

    scheduledEnd: timeSchema,

    workforceCount: z
      .number()
      .min(0),

    operationalPriority: z
      .number()
      .min(0)
      .max(1),
  }),

  zone: z
    .object({
      temperatureSensitivity: z
        .number()
        .min(0)
        .max(1),

      operationalPriority: z
        .number()
        .min(0)
        .max(1),
    })
    .nullable(),

  inventory: z
    .object({
      temperatureSensitivity: z
        .number()
        .min(0)
        .max(1),

      exposureValue: z
        .number()
        .min(0),
    })
    .nullable(),

  assumptions:
    impactAssumptionsSchema,
});

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

const decisionSchema = z
  .object({
    recommendation: z.unknown(),

    projectedRisk: z
      .unknown()
      .nullable()
      .optional(),
  })
  .passthrough();

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

        type: z.literal(
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

        type: z.literal(
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

        type: z.literal(
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

        type: z.literal(
          "maintain",
        ),
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
