import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  uploadToSpaces,
  deleteFromSpaces,
  generateSpacesKey,
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
    if (session.user.role !== "SUPERADMIN") {
      const site = await prisma.site.findFirst({
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
    }

    const formData = await request.formData();
    const image = formData.get("image") as File;
    const imageType = formData.get("imageType") as string;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!imageType || !["logo", "coverImage"].includes(imageType)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      );
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

    // Check if we're in production and have Spaces configuration
    const isProduction = process.env.NODE_ENV === "production";
    const hasSpacesConfig =
      process.env.DO_SPACES_ACCESS_KEY &&
      process.env.DO_SPACES_BUCKET &&
      process.env.DO_SPACES_ENDPOINT;

    if (isProduction && hasSpacesConfig) {
      // Upload to DigitalOcean Spaces
      const extension = image.name.split(".").pop();
      const originalFilename = `${Date.now()}.${extension}`;
      const spacesKey = generateSpacesKey(siteId, imageType, originalFilename);

      imageUrl = await uploadToSpaces(buffer, spacesKey, image.type);
    } else {
      // Local development - save to filesystem
      const siteDir = join(process.cwd(), "public", "sites", siteId);
      if (!existsSync(siteDir)) {
        await mkdir(siteDir, { recursive: true });
      }

      const timestamp = Date.now();
      const extension = image.name.split(".").pop();
      const filename = `${imageType}-${timestamp}.${extension}`;
      const filepath = join(siteDir, filename);

      await writeFile(filepath, buffer);
      // In development, save the full URL path with host
      imageUrl = `http://localhost:3005/sites/${siteId}/${filename}`;
    }

    // Update site in database
    const updateData = {
      [imageType]: imageUrl,
    };

    await prisma.site.update({
      where: { id: siteId },
      data: updateData,
    });

    return NextResponse.json({
      message: `${imageType} uploaded successfully`,
      url: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
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

    // Check if user has access to this site (super admin or site user)
    if (session.user.role !== "SUPERADMIN") {
      const site = await prisma.site.findFirst({
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
    }

    const body = await request.json();
    const { imageType } = body;

    if (!imageType || !["logo", "coverImage"].includes(imageType)) {
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 }
      );
    }

    // Get current site data to find existing image
    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { logo: true, coverImage: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const currentImageUrl = imageType === "logo" ? site.logo : site.coverImage;

    // Remove from database
    const updateData = {
      [imageType]: null,
    };

    await prisma.site.update({
      where: { id: siteId },
      data: updateData,
    });

    // Remove file from storage if it exists
    if (currentImageUrl) {
      try {
        if (isSpacesUrl(currentImageUrl)) {
          // Remove from DigitalOcean Spaces
          const spacesKey = getSpacesKeyFromUrl(currentImageUrl);
          if (spacesKey) {
            await deleteFromSpaces(spacesKey);
          }
        } else if (
          currentImageUrl.startsWith(`/sites/${siteId}/`) ||
          currentImageUrl.startsWith(`http://localhost:3005/sites/${siteId}/`)
        ) {
          // Remove from local filesystem
          const filename = currentImageUrl.split("/").pop();
          const filepath = join(
            process.cwd(),
            "public",
            "sites",
            siteId,
            filename!
          );
          if (existsSync(filepath)) {
            await unlink(filepath);
          }
        }
      } catch (fileError) {
        console.error("Error removing file:", fileError);
        // Don't fail the request if file removal fails
      }
    }

    return NextResponse.json({
      message: `${imageType} removed successfully`,
    });
  } catch (error) {
    console.error("Error removing image:", error);
    return NextResponse.json(
      { error: "Failed to remove image" },
      { status: 500 }
    );
  }
}
