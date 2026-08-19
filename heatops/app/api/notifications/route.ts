import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  combineNotificationResults,
  generateOperatingPlanNotifications,
  generateRiskChangeNotification,
  generateSimulationNotification,
} from "@/lib/notifications";

const operatingPlanEventSchema = z.object({
  type: z.literal("operating_plan"),

  siteId: z.string().uuid(),

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

  title: z.string().min(1),
});

const riskChangeEventSchema = z.object({
  type: z.literal("risk_change"),

  siteId: z.string().uuid(),

  operationId: z
    .string()
    .uuid()
    .optional(),

  operationName: z
    .string()
    .min(1)
    .optional(),

  previousRisk: z
    .number()
    .min(0)
    .max(100),

  currentRisk: z
    .number()
    .min(0)
    .max(100),
});

const simulationEventSchema = z.object({
  type: z.literal("simulation"),

  siteId: z.string().uuid(),

  simulationId: z.string().uuid(),

  name: z.string().min(1),

  riskBefore: z
    .number()
    .min(0)
    .max(100),

  riskAfter: z
    .number()
    .min(0)
    .max(100),

  modeledImpact: z
    .number()
    .nullable()
    .optional(),
});

const requestSchema = z.object({
  events: z
    .array(
      z.discriminatedUnion("type", [
        operatingPlanEventSchema,
        riskChangeEventSchema,
        simulationEventSchema,
      ]),
    )
    .min(1),
});

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const input =
      requestSchema.parse(body);

    const results = input.events.map(
      (event) => {
        switch (event.type) {
          case "operating_plan":
            return generateOperatingPlanNotifications(
              event,
            );

          case "risk_change":
            return generateRiskChangeNotification(
              event,
            );

          case "simulation":
            return generateSimulationNotification(
              event,
            );
        }
      },
    );

    const notifications =
      combineNotificationResults(
        ...results,
      );

    return NextResponse.json(
      {
        success: true,
        data: notifications,
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
            "INVALID_NOTIFICATION_INPUT",

          details: error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Notification generation failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "NOTIFICATION_GENERATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
  }
