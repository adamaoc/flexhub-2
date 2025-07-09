import { NextResponse } from "next/server";
import { scdReadOnly } from "@/lib/prisma";
import type { ScdQuoteRequestStatus } from "@prisma/client";

// READ-ONLY API for Schedule Clean Dallas quote requests
// This route only provides data for admin dashboards and reporting
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Build query filters
    const where: { status?: ScdQuoteRequestStatus } = {};
    if (status && status !== "ALL") {
      where.status = status as ScdQuoteRequestStatus;
    }

    // Execute read-only query
    const quoteRequests = await scdReadOnly.quoteRequests.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        cleaningType: true,
        status: true,
        createdAt: true,
        scheduledDate: true,
        quoteAmount: true,
        confirmationNumber: true,
        squareFootage: true,
        rooms: true,
        bathrooms: true,
        contacted: true,
        completed: true,
        quoteSent: true,
        quoteSentAt: true,
        // Exclude sensitive fields like notes, address
      },
      orderBy: {
        createdAt: "desc",
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    });

    // Get summary statistics
    const stats = await Promise.all([
      scdReadOnly.quoteRequests.count({ where: { status: "PENDING" } }),
      scdReadOnly.quoteRequests.count({ where: { status: "CONTACTED" } }),
      scdReadOnly.quoteRequests.count({ where: { status: "SCHEDULED" } }),
      scdReadOnly.quoteRequests.count({ where: { status: "COMPLETED" } }),
      scdReadOnly.quoteRequests.count({ where: { status: "CANCELED" } }),
    ]);

    return NextResponse.json({
      requests: quoteRequests,
      stats: {
        pending: stats[0],
        contacted: stats[1],
        scheduled: stats[2],
        completed: stats[3],
        canceled: stats[4],
        total: stats.reduce((a, b) => a + b, 0),
      },
    });
  } catch (error) {
    console.error("Error fetching SCD quote requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch quote requests" },
      { status: 500 }
    );
  }
}

// Explicitly disable write operations
export async function POST() {
  return NextResponse.json(
    {
      error:
        "Write operations are not allowed. Use the Schedule Clean Dallas app for data modifications.",
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    {
      error:
        "Write operations are not allowed. Use the Schedule Clean Dallas app for data modifications.",
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    {
      error:
        "Write operations are not allowed. Use the Schedule Clean Dallas app for data modifications.",
    },
    { status: 405 }
  );
}
