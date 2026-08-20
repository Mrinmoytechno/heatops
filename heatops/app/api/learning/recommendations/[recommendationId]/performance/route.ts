import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  buildRecommendationPerformanceProfile,
  getEvidenceByRecommendationId,
} from "@/lib/learning";

type RouteContext = {
  params: Promise<{
    recommendationId: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const {
      recommendationId,
    } = await context.params;

    if (
      !recommendationId ||
      recommendationId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_RECOMMENDATION_ID",
        },
        {
          status: 400,
        },
      );
    }

    const evidence =
      await getEvidenceByRecommendationId(
        recommendationId,
      );

    const performance =
      buildRecommendationPerformanceProfile(
        recommendationId,
        evidence,
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          performance,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Failed to build recommendation performance profile:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "RECOMMENDATION_PERFORMANCE_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
