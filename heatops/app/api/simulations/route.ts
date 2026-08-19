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

const scheduleSchema = z.object({
  start: z.string().min(1),

  end: z.string().min(1),
});

const decisionSchema = z.object({
  risk: z.object({
    score: z.number().min(0).max(100),
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
      score: z.number().min(0).max(100),
    })
    .nullable()
    .optional(),
});

const operatingPlanItemSchema = z.object({
  operationId: z.string().uuid(),

  operationName: z.string().min(1),

  zoneName: z.string().nullable().optional(),

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

  currentSchedule: scheduleSchema,

  recommendedSchedule: scheduleSchema
    .nullable()
    .optional(),

  decision: decisionSchema,

  summary: z.string(),

  reason: z.string(),

  riskBefore: z.number().min(0).max(100),

  projectedRiskAfter: z
    .number()
    .min(0)
    .max(100)
    .nullable(),

  createdAt: z.string(),
});

const operatingPlanSchema = z.object({
  siteId: z.string().uuid(),

  analysisTime: z.string().datetime(),

  title: z.string(),

  summary: z.string(),

  items: z
    .array(operatingPlanItemSchema)
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

  generatedAt: z.string().datetime(),
});

const changeSchema = z.discriminatedUnion(
  "type",
  [
    z.object({
      operationId: z.string().uuid(),

      type: z.literal("move_earlier"),

      minutes: z
        .number()
        .int()
        .positive(),
    }),

    z.object({
      operationId: z.string().uuid(),

      type: z.literal("move_later"),

      minutes: z
        .number()
        .int()
        .positive(),
    }),

    z.object({
      operationId: z.string().uuid(),

      type: z.literal("set_schedule"),

      start: z.string().min(1),

      end: z.string().min(1),
    }),

    z.object({
      operationId: z.string().uuid(),

      type: z.literal(
        "apply_recommendation",
      ),
    }),

    z.object({
      operationId: z.string().uuid(),

      type: z.literal("maintain"),
    }),
  ],
);

const requestSchema = z.object({
  name: z.string().min(1).max(100),

  description: z
    .string()
    .max(500)
    .nullable()
    .optional(),

  operatingPlan: operatingPlanSchema,

  changes: z.array(changeSchema).min(1),
});

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const validatedInput =
      requestSchema.parse(body);

    const simulation = runSimulation(
      validatedInput,
    );

    const notificationResult =
      generateSimulationNotification({
        siteId:
          validatedInput.operatingPlan.siteId,

        simulationId:
          simulation.scenarioId,

        name: simulation.name,

        riskBefore:
          simulation.comparison.baselineRisk,

        riskAfter:
          simulation.comparison.scenarioRisk,

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,

          error:
            "INVALID_SIMULATION_INPUT",

          details: error.flatten(),
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

        error: "SIMULATION_FAILED",
      },
     
