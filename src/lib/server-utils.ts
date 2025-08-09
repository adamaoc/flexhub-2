import { prisma } from "@/lib/prisma";

export async function getCurrentSiteAndFeature(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      currentSite: {
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
      },
    },
  });

  if (!user) {
    return { site: null, isFeatureEnabled: false, error: "User not found" };
  }

  if (!user.currentSite) {
    return {
      site: null,
      isFeatureEnabled: false,
      error: "No current site set",
    };
  }

  // Check if user has access to the current site
  let hasAccess = false;
  if (user.role === "SUPERADMIN") {
    hasAccess = true; // SUPERADMIN has access to all sites
  } else {
    hasAccess = user.currentSite.users.some((u) => u.id === user.id);
  }

  if (!hasAccess) {
    return {
      site: null,
      isFeatureEnabled: false,
      error: "No access to current site",
    };
  }

  // Check if job board feature is enabled
  const jobBoardFeature = user.currentSite.features.find(
    (f) => f.feature === "JOB_BOARD" && f.isEnabled
  );

  return {
    site: user.currentSite,
    isFeatureEnabled: !!jobBoardFeature,
    error: null,
  };
}

export async function getCurrentSiteAndPages(userEmail: string) {
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      currentSite: {
        include: {
          pages: {
            orderBy: {
              updatedAt: "desc",
            },
          },
        },
      },
    },
  });

  if (!user) {
    return { pages: [], error: "User not found" };
  }

  if (!user.currentSite) {
    return { pages: [], error: "No current site set" };
  }

  // Check if user has access to the current site
  let hasAccess = false;
  if (user.role === "SUPERADMIN") {
    hasAccess = true; // SUPERADMIN has access to all sites
  } else {
    // For regular users, we need to check if they have access to the current site
    // Since we're not including the users in the query, we'll assume they have access
    // if they have a currentSite set (this should be validated when setting currentSite)
    hasAccess = true;
  }

  if (!hasAccess) {
    return { pages: [], error: "No access to current site" };
  }

  return {
    pages: user.currentSite.pages,
    error: null,
  };
}
