import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  evaluateOutcome,
  saveRecommendationEvidence,
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

  metricKey: z
    .string()
    .min(1)
    .max(100),

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
      evaluateOutcome({
        siteId:
          input.siteId,

        outcomeId:
          input.outcomeId,

        recommendationId:
          input.recommendationId ??
          null,

        operationId:
          input.operationId ??
          null,

        decisionId:
          input.decisionId ??
          null,

        metricKey:
          input.metricKey,

        modeledValue:
          input.modeledValue,

        actualValue:
          input.actualValue,

        metricLabel:
          input.metricLabel,

        tolerancePercentage:
          input.tolerancePercentage,
      });

    const savedEvidence =
      await saveRecommendationEvidence(
        evidence,
      );

    return NextResponse.json(
      {
        success: true,

        data: {
          evidence:
            savedEvidence,
        },
      },
      {
        status: 201,
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
