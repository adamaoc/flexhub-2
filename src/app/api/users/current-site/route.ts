import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await request.json();

    if (!siteId) {
      return NextResponse.json(
        { error: "Site ID is required" },
        { status: 400 }
      );
    }

    // Get the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        sites: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if the site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check if user has access to this site
    let hasAccess = false;
    if (user.role === "SUPERADMIN") {
      hasAccess = true; // SUPERADMIN has access to all sites
    } else {
      hasAccess = user.sites.some((s) => s.id === siteId);
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "No access to this site" },
        { status: 403 }
      );
    }

    // Update the user's current site
    await prisma.user.update({
      where: { email: session.user.email },
      data: { currentSiteId: siteId },
    });

    return NextResponse.json(
      { message: "Current site updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating current site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the user's current site
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        currentSite: {
          select: {
            id: true,
            name: true,
            description: true,
            domain: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      currentSite: user.currentSite,
    });
  } catch (error) {
    console.error("Error getting current site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
