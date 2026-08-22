import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  resolveTimezone,
} from "@/lib/location/location-service";

const timezoneQuerySchema =
  z.object({
    latitude:
      z.coerce
        .number()
        .min(-90)
        .max(90),

    longitude:
      z.coerce
        .number()
        .min(-180)
        .max(180),
  });

export async function GET(
  request: NextRequest,
) {
  try {
    const parsed =
      timezoneQuerySchema.safeParse({
        latitude:
          request.nextUrl.searchParams.get(
            "latitude",
          ),

        longitude:
          request.nextUrl.searchParams.get(
            "longitude",
          ),
      });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_COORDINATES",
          details:
            parsed.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const result =
      await resolveTimezone(
        parsed.data.latitude,
        parsed.data.longitude,
      );

    return NextResponse.json(
      {
        success: true,
        data:
          result,
      },
    );
  } catch (error) {
    console.error(
      "Failed to resolve timezone:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "TIMEZONE_RESOLUTION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
