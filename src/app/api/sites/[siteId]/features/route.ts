import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Feature definitions to get display names and descriptions
const FEATURE_DEFINITIONS = {
  PAGES: {
    displayName: "Pages",
    description: "Create and manage static pages",
  },
  BLOG_POSTS: {
    displayName: "Blog Posts",
    description: "Publish and manage blog content",
  },
  MEDIA_FILES: {
    displayName: "Media Files",
    description: "Upload and manage media files",
  },
  EMAIL_MANAGEMENT: {
    displayName: "Email Management",
    description: "Manage email campaigns and templates",
  },
  CONTACT_MANAGEMENT: {
    displayName: "Contact Management",
    description: "Manage contact forms and inquiries",
  },
  SPONSORS: {
    displayName: "Sponsors",
    description: "Manage sponsor relationships and content",
  },
  ONLINE_STORE: {
    displayName: "Online Store",
    description: "E-commerce functionality",
  },
  NEWSLETTER: {
    displayName: "Newsletter",
    description: "Newsletter subscription and management",
  },
  ANALYTICS: {
    displayName: "Analytics",
    description: "Site analytics and reporting",
  },
  SEO_TOOLS: {
    displayName: "SEO Tools",
    description: "Search engine optimization tools",
  },
  SOCIAL_MEDIA_INTEGRATION: {
    displayName: "Social Media Integration",
    description: "Connect with social media platforms",
  },
  MULTI_LANGUAGE: {
    displayName: "Multi Language",
    description: "Multi-language content support",
  },
  CUSTOM_FORMS: {
    displayName: "Custom Forms",
    description: "Create custom forms and surveys",
  },
  MEMBER_AREA: {
    displayName: "Member Area",
    description: "Member-only content and features",
  },
  EVENT_MANAGEMENT: {
    displayName: "Event Management",
    description: "Manage events and registrations",
  },
} as const;

// GET - Fetch all features for a site
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only SUPERADMIN can manage site features
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const features = await prisma.siteFeature.findMany({
      where: { siteId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ features });
  } catch (error) {
    console.error("Error fetching site features:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add a feature to a site
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only SUPERADMIN can manage site features
    if (user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { feature, isEnabled = true, config } = body;

    if (!feature) {
      return NextResponse.json(
        { error: "Feature type is required" },
        { status: 400 }
      );
    }

    // Get feature definition
    const featureDefinition =
      FEATURE_DEFINITIONS[feature as keyof typeof FEATURE_DEFINITIONS];
    if (!featureDefinition) {
      return NextResponse.json(
        { error: "Invalid feature type" },
        { status: 400 }
      );
    }

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: siteId },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Check if feature already exists for this site
    const existingFeature = await prisma.siteFeature.findFirst({
      where: {
        siteId,
        feature,
      },
    });

    if (existingFeature) {
      return NextResponse.json(
        { error: "This feature is already enabled for this site" },
        { status: 409 }
      );
    }

    const siteFeature = await prisma.siteFeature.create({
      data: {
        siteId,
        feature,
        displayName: featureDefinition.displayName,
        description: featureDefinition.description,
        isEnabled,
        config,
      },
    });

    return NextResponse.json({ feature: siteFeature }, { status: 201 });
  } catch (error) {
    console.error("Error adding site feature:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
