import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createOperatingPlan } from "@/lib/operating-plan";

const decisionSchema = z.object({
  risk: z.object({
    score: z.number(),
  }),

  recommendation: z.object({
    action: z.string(),
    reason: z.string(),
    schedule: z
      .object({
        start: z.string(),
        end: z.string(),
      })
      .nullable()
      .optional(),
  }),

  projectedRisk: z
    .object({
      score: z.number(),
    })
    .nullable()
    .optional(),
});

const operationSchema = z.object({
  operationId: z.string().uuid(),
  operationName: z.string().min(1),

  zoneName: z.string().nullable().optional(),

  scheduledStart: z.string().min(1),
  scheduledEnd: z.string().min(1),

  decision: decisionSchema,
});

const requestSchema = z.object({
  siteId: z.string().uuid(),
  analysisTime: z.string().datetime(),
  operations: z.array(operationSchema).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedInput = requestSchema.parse(body);

    const operatingPlan = createOperatingPlan(validatedInput);

    return NextResponse.json(
      {
        success: true,
        data: operatingPlan,
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
          error: "INVALID_OPERATING_PLAN_INPUT",
          details: error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error("Failed to create operating plan:", error);

    return NextResponse.json(
      {
        success: false,
        error: "OPERATING_PLAN_GENERATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
