import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  searchLocations,
} from "@/lib/location/location-service";

const searchQuerySchema =
  z.object({
    query:
      z.string()
        .trim()
        .min(2)
        .max(200),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(10)
        .optional(),
  });

export async function GET(
  request: NextRequest,
) {
  try {
    const parsed =
      searchQuerySchema.safeParse({
        query:
          request.nextUrl.searchParams.get(
            "query",
          ),

        limit:
          request.nextUrl.searchParams.get(
            "limit",
          ) ?? undefined,
      });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_LOCATION_SEARCH_QUERY",
          details:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const locations =
      await searchLocations(
        parsed.data.query,
        parsed.data.limit,
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          locations,
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to search locations:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "LOCATION_SEARCH_FAILED",
      },
      {
        status: 500,
      },
    );
  }
        }
