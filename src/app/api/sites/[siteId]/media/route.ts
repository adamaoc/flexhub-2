import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  uploadToSpaces,
  deleteFromSpaces,
  generateMediaFileKey,
  getSpacesKeyFromUrl,
  isSpacesUrl,
} from "@/lib/spaces";

// GET - List media files for a site
export async function GET(
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
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(session.user.role !== "SUPERADMIN" && {
          users: {
            some: {
              email: session.user.email,
            },
          },
        }),
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found or access denied" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");

    // Get media files for this site
    const mediaFiles = await prisma.mediaFile.findMany({
      where: {
        siteId: siteId,
        ...(folder ? { folderPath: folder } : {}),
      },
      orderBy: [{ folderPath: "asc" }, { createdAt: "desc" }],
    });

    // Group files by folder
    const filesByFolder: Record<string, typeof mediaFiles> = {};

    mediaFiles.forEach((file) => {
      const folderKey = file.folderPath || "root";
      if (!filesByFolder[folderKey]) {
        filesByFolder[folderKey] = [];
      }
      filesByFolder[folderKey].push(file);
    });

    // Get list of all folders
    const folders = [
      ...new Set(mediaFiles.map((f) => f.folderPath).filter(Boolean)),
    ];

    return NextResponse.json({
      files: mediaFiles,
      filesByFolder,
      folders,
      site: {
        id: site.id,
        name: site.name,
      },
    });
  } catch (error) {
    console.error("Error fetching media files:", error);
    return NextResponse.json(
      { error: "Failed to fetch media files" },
      { status: 500 }
    );
  }
}

// POST - Upload media file
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

    // Check if user has access to this site
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(session.user.role !== "SUPERADMIN" && {
          users: {
            some: {
              email: session.user.email,
            },
          },
        }),
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found or access denied" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folderPath = formData.get("folderPath") as string | null;
    const description = formData.get("description") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (max 50MB for media files)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 50MB" },
        { status: 400 }
      );
    }

    // Validate file type (allow common media types)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "audio/mp3",
      "audio/wav",
      "audio/ogg",
      "application/pdf",
      "text/plain",
      "application/json",
      "application/xml",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not supported" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate spaces key
    const spacesKey = generateMediaFileKey(
      siteId,
      site.name,
      file.name,
      folderPath || undefined
    );

    // Upload to Digital Ocean Spaces
    const fileUrl = await uploadToSpaces(buffer, spacesKey, file.type);

    // Save to database
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filename: spacesKey.split("/").pop() || file.name,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: fileUrl,
        folderPath: folderPath || null,
        description: description || null,
        siteId: siteId,
      },
    });

    return NextResponse.json({
      message: "File uploaded successfully",
      file: mediaFile,
    });
  } catch (error) {
    console.error("Error uploading media file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// DELETE - Delete media file
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
    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        ...(session.user.role !== "SUPERADMIN" && {
          users: {
            some: {
              email: session.user.email,
            },
          },
        }),
      },
    });

    if (!site) {
      return NextResponse.json(
        { error: "Site not found or access denied" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { error: "File ID is required" },
        { status: 400 }
      );
    }

    // Get the media file
    const mediaFile = await prisma.mediaFile.findFirst({
      where: {
        id: fileId,
        siteId: siteId,
      },
    });

    if (!mediaFile) {
      return NextResponse.json(
        { error: "Media file not found" },
        { status: 404 }
      );
    }

    // Delete from Digital Ocean Spaces
    if (isSpacesUrl(mediaFile.url)) {
      const spacesKey = getSpacesKeyFromUrl(mediaFile.url);
      if (spacesKey) {
        try {
          await deleteFromSpaces(spacesKey);
        } catch (error) {
          console.error("Error deleting from spaces:", error);
          // Continue with database deletion even if spaces deletion fails
        }
      }
    }

    // Delete from database
    await prisma.mediaFile.delete({
      where: {
        id: fileId,
      },
    });

    return NextResponse.json({
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
