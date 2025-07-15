import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin or superadmin
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const siteId = searchParams.get("siteId");
    const isRead = searchParams.get("isRead");

    // Build the where clause for sites with contact management feature
    const siteWhere = {
      features: {
        some: {
          feature: "CONTACT_MANAGEMENT" as const,
          isEnabled: true,
        },
      },
    };

    if (siteId) {
      Object.assign(siteWhere, { id: siteId });
    }

    // Build the where clause for submissions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const submissionWhere: any = {
      site: siteWhere,
    };

    if (isRead !== null) {
      submissionWhere.isRead = isRead === "true";
    }

    // Get submissions with pagination and include site and form field data
    const [submissions, total] = await Promise.all([
      prisma.contactSubmission.findMany({
        where: submissionWhere,
        include: {
          site: {
            select: {
              id: true,
              name: true,
              domain: true,
            },
          },
          contactForm: {
            select: {
              id: true,
              name: true,
            },
          },
          submissionData: {
            include: {
              contactFormField: {
                select: {
                  fieldName: true,
                  fieldLabel: true,
                  fieldType: true,
                },
              },
            },
            orderBy: {
              contactFormField: {
                sortOrder: "asc",
              },
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contactSubmission.count({ where: submissionWhere }),
    ]);

    // Get all sites with contact management for the filter dropdown
    const sitesWithContactManagement = await prisma.site.findMany({
      where: siteWhere,
      select: {
        id: true,
        name: true,
        domain: true,
        _count: {
          select: {
            contactSubmissions: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      submissions,
      sites: sitesWithContactManagement,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin contact submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
