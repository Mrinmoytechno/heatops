import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  evaluateOutcome,
} from "@/lib/learning";

const requestSchema = z.object({
  siteId: z.string().uuid(),

  outcomeId: z.string().uuid(),

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

  decisionId: z
    .string()
    .uuid()
    .nullable()
    .optional(),

  modeledValue: z
    .number()
    .nullable(),

  actualValue: z
    .number()
    .nullable(),

  metricLabel: z
    .string()
    .min(1)
    .max(200),

  tolerancePercentage: z
    .number()
    .min(0)
    .max(100)
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

    const evidence =
      evaluateOutcome(input);

    return NextResponse.json(
      {
        success: true,

        data: {
          evidence,
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
            "INVALID_EVALUATION_INPUT",

          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to evaluate outcome:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        error:
          "OUTCOME_EVALUATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
      }
