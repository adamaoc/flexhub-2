import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  uploadToSpaces,
  deleteFromSpaces,
  generateMediaFileKey,
  getSpacesKeyFromUrl,
  isSpacesUrl,
} from "@/lib/spaces";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { siteId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this site (super admin or site user)
    let site;
    if (session.user.role !== "SUPERADMIN") {
      site = await prisma.site.findFirst({
        where: {
          id: siteId,
          users: {
            some: {
              email: session.user.email,
            },
          },
        },
      });

      if (!site) {
        return NextResponse.json(
          { error: "Site not found or access denied" },
          { status: 404 }
        );
      }
    } else {
      site = await prisma.site.findUnique({
        where: { id: siteId },
      });

      if (!site) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 });
      }
    }

    // Check if works feature is enabled
    const worksFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "WORKS",
        },
      },
    });

    if (!worksFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Works feature is not enabled for this site" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Validate file type
    if (!image.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (image.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let imageUrl: string;

    // Check if we have Spaces configuration (allow for both dev and prod)
    const hasSpacesConfig =
      process.env.DO_SPACES_ACCESS_KEY &&
      process.env.DO_SPACES_BUCKET &&
      process.env.DO_SPACES_ENDPOINT;

    if (hasSpacesConfig) {
      // Upload to DigitalOcean Spaces with works folder structure
      const spacesKey = generateMediaFileKey(
        siteId,
        site.name,
        image.name,
        "works"
      );

      imageUrl = await uploadToSpaces(buffer, spacesKey, image.type);
    } else {
      // Local development - save to filesystem
      const siteDir = join(process.cwd(), "public", "sites", siteId, "works");
      if (!existsSync(siteDir)) {
        await mkdir(siteDir, { recursive: true });
      }

      const timestamp = Date.now();
      const extension = image.name.split(".").pop();
      const filename = `${timestamp}.${extension}`;
      const filepath = join(siteDir, filename);

      await writeFile(filepath, buffer);
      // In development, save the full URL path with host
      const port = process.env.PORT || 3005;
      imageUrl = `http://localhost:${port}/sites/${siteId}/works/${filename}`;
    }

    return NextResponse.json({
      message: "Work image uploaded successfully",
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading work image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { siteId } = await params;

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this site
    let site;
    if (session.user.role !== "SUPERADMIN") {
      site = await prisma.site.findFirst({
        where: {
          id: siteId,
          users: {
            some: {
              email: session.user.email,
            },
          },
        },
      });

      if (!site) {
        return NextResponse.json(
          { error: "Site not found or access denied" },
          { status: 404 }
        );
      }
    } else {
      site = await prisma.site.findUnique({
        where: { id: siteId },
      });

      if (!site) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 });
      }
    }

    // Check if works feature is enabled
    const worksFeature = await prisma.siteFeature.findUnique({
      where: {
        siteId_feature: {
          siteId,
          feature: "WORKS",
        },
      },
    });

    if (!worksFeature?.isEnabled) {
      return NextResponse.json(
        { error: "Works feature is not enabled for this site" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Check if it's a Spaces URL and delete from Spaces
    if (isSpacesUrl(imageUrl)) {
      const spacesKey = getSpacesKeyFromUrl(imageUrl);
      if (spacesKey) {
        await deleteFromSpaces(spacesKey);
      }
    }
    // For local files, we don't delete them automatically for safety

    return NextResponse.json({
      message: "Work image deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting work image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}

