import {
  NextResponse,
} from "next/server";

import {
  resolveWorkspace,
} from "@/lib/sites/site-service";

export async function GET() {
  try {
    const workspace =
      await resolveWorkspace();

    return NextResponse.json(
      {
        success: true,
        data: {
          workspace,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Failed to resolve workspace:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "WORKSPACE_RESOLUTION_FAILED",
      },
      {
        status: 500,
      },
    );
  }
}
