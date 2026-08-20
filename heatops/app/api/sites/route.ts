import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  createSite,
  listSites,
} from "@/lib/sites/site-service";

const createSiteSchema =
  z.object({
    organizationId:
      z.string().uuid(),

    name:
      z.string()
        .trim()
        .min(1)
        .max(200),

    siteType:
      z.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    latitude:
      z.number()
        .min(-90)
        .max(90),

    longitude:
      z.number()
        .min(-180)
        .max(180),

    timezone:
      z.string()
        .trim()
        .min(1)
        .max(100),

    operatingStart:
      z.string()
        .regex(
          /^\d{2}:\d{2}$/,
          "Operating start must use HH:MM format.",
        ),

    operatingEnd:
      z.string()
        .regex(
          /^\d{2}:\d{2}$/,
          "Operating end must use HH:MM format.",
        ),
  });

export async function GET(
  request: NextRequest,
) {
  try {
    const organizationId =
      request.nextUrl.searchParams.get(
        "organizationId",
      );

    if (!organizationId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ORGANIZATION_ID_REQUIRED",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !z.string()
        .uuid()
        .safeParse(
          organizationId,
        ).success
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_ORGANIZATION_ID",
        },
        {
          status: 400,
        },
      );
    }

    const sites =
      await listSites(
        organizationId,
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          sites,
        },
      },
    );
  } catch (error) {
    console.error(
      "Failed to fetch sites:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SITES_FETCH_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const input =
      createSiteSchema.parse(
        body,
      );

    const site =
      await createSite(
        input,
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          site,
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
            "INVALID_SITE_INPUT",
          details:
            error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to create site:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SITE_CREATION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
    }
