import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Read-only access for Schedule Clean Dallas data
// This prevents accidental writes from FlexHub CMS
export const scdReadOnly = {
  // Read-only access to quote requests
  quoteRequests: {
    findMany: prisma.scdQuoteRequest.findMany.bind(prisma.scdQuoteRequest),
    findUnique: prisma.scdQuoteRequest.findUnique.bind(prisma.scdQuoteRequest),
    findFirst: prisma.scdQuoteRequest.findFirst.bind(prisma.scdQuoteRequest),
    count: prisma.scdQuoteRequest.count.bind(prisma.scdQuoteRequest),
    aggregate: prisma.scdQuoteRequest.aggregate.bind(prisma.scdQuoteRequest),
    groupBy: prisma.scdQuoteRequest.groupBy.bind(prisma.scdQuoteRequest),
  },
} as const;

// Type-safe read-only operations
export type ScdQuoteRequestReadOnly = typeof scdReadOnly.quoteRequests;
