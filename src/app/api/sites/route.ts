import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { sites: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let sites;

    // Role-based access control
    if (user.role === "SUPERADMIN") {
      // Super admins can see all sites
      sites = await prisma.site.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          features: {
            select: {
              id: true,
              feature: true,
              displayName: true,
              description: true,
              isEnabled: true,
              config: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (user.role === "ADMIN") {
      // Admins can see sites they're connected to
      sites = await prisma.site.findMany({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          features: {
            select: {
              id: true,
              feature: true,
              displayName: true,
              description: true,
              isEnabled: true,
              config: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Regular users can only see sites they're connected to
      sites = await prisma.site.findMany({
        where: {
          users: {
            some: {
              id: user.id,
            },
          },
        },
        include: {
          users: {
            where: {
              id: user.id,
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          pages: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              createdAt: true,
            },
          },
          blogPosts: {
            select: {
              id: true,
              title: true,
              slug: true,
              isPublished: true,
              publishedAt: true,
              createdAt: true,
            },
          },
          mediaFiles: {
            select: {
              id: true,
              filename: true,
              originalName: true,
              mimeType: true,
              size: true,
              url: true,
              createdAt: true,
            },
          },
          features: {
            select: {
              id: true,
              feature: true,
              displayName: true,
              description: true,
              isEnabled: true,
              config: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          _count: {
            select: {
              pages: true,
              blogPosts: true,
              mediaFiles: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Error fetching sites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Only ADMIN and SUPERADMIN can create sites
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description, domain } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Site name is required" },
        { status: 400 }
      );
    }

    // Validate domain format if provided
    if (domain && typeof domain === "string" && domain.trim().length > 0) {
      const domainRegex =
        /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!domainRegex.test(domain.trim())) {
        return NextResponse.json(
          { error: "Invalid domain format" },
          { status: 400 }
        );
      }
    }

    // Check if site name already exists
    const existingSite = await prisma.site.findFirst({
      where: {
        name: name.trim(),
      },
    });

    if (existingSite) {
      return NextResponse.json(
        { error: "A site with this name already exists" },
        { status: 409 }
      );
    }

    // Check if domain already exists (if provided)
    if (domain && domain.trim().length > 0) {
      const existingDomain = await prisma.site.findFirst({
        where: {
          domain: domain.trim(),
        },
      });

      if (existingDomain) {
        return NextResponse.json(
          { error: "A site with this domain already exists" },
          { status: 409 }
        );
      }
    }

    // Create the site and connect the current user to it
    const site = await prisma.site.create({
      data: {
        name: name.trim(),
        description:
          description && description.trim().length > 0
            ? description.trim()
            : null,
        domain: domain && domain.trim().length > 0 ? domain.trim() : null,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            pages: true,
            blogPosts: true,
            mediaFiles: true,
            users: true,
          },
        },
      },
    });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    console.error("Error creating site:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
