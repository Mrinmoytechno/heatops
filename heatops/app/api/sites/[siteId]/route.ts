import {
  NextRequest,
  NextResponse,
} from "next/server";

import { z } from "zod";

import {
  deleteSite,
  getSite,
  updateSite,
} from "@/lib/sites/site-service";

type RouteContext = {
  params: Promise<{
    siteId: string;
  }>;
};

const updateSiteSchema =
  z.object({
    name:
      z.string()
        .trim()
        .min(1)
        .max(200)
        .optional(),

    siteType:
      z.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    latitude:
      z.number()
        .min(-90)
        .max(90)
        .optional(),

    longitude:
      z.number()
        .min(-180)
        .max(180)
        .optional(),

    timezone:
      z.string()
        .trim()
        .min(1)
        .max(100)
        .optional(),

    operatingStart:
      z.string()
        .regex(
          /^\d{2}:\d{2}$/,
        )
        .optional(),

    operatingEnd:
      z.string()
        .regex(
          /^\d{2}:\d{2}$/,
        )
        .optional(),
  })
  .refine(
    (input) =>
      Object.keys(input).length > 0,
    {
      message:
        "At least one field must be provided.",
    },
  );

async function resolveSiteId(
  context: RouteContext,
): Promise<string> {
  const {
    siteId,
  } = await context.params;

  if (
    !z.string()
      .uuid()
      .safeParse(
        siteId,
      ).success
  ) {
    throw new Error(
      "INVALID_SITE_ID",
    );
  }

  return siteId;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const siteId =
      await resolveSiteId(
        context,
      );

    const site =
      await getSite(siteId);

    return NextResponse.json(
      {
        success: true,
        data: {
          site,
        },
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SITE_ID"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_SITE_ID",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to fetch site:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SITE_FETCH_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const siteId =
      await resolveSiteId(
        context,
      );

    const body =
      await request.json();

    const input =
      updateSiteSchema.parse(
        body,
      );

    const site =
      await updateSite(
        siteId,
        input,
      );

    return NextResponse.json(
      {
        success: true,
        data: {
          site,
        },
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

    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SITE_ID"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_SITE_ID",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to update site:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SITE_UPDATE_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const siteId =
      await resolveSiteId(
        context,
      );

    await deleteSite(
      siteId,
    );

    return NextResponse.json(
      {
        success: true,
      },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "INVALID_SITE_ID"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "INVALID_SITE_ID",
        },
        {
          status: 400,
        },
      );
    }

    console.error(
      "Failed to delete site:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "SITE_DELETION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
      }
