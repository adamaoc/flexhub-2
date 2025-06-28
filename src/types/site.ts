export type SiteFeature = {
  id: string;
  feature: string;
  displayName: string;
  description: string | null;
  isEnabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type Site = {
  id: string;
  name: string;
  description: string | null;
  domain: string | null;
  logo: string | null;
  coverImage: string | null;
  createdAt: string;
  updatedAt: string;
  users: Array<{
    id: string;
    name: string | null;
    email: string;
    role: string;
    image?: string | null;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    createdAt: string;
  }>;
  blogPosts: Array<{
    id: string;
    title: string;
    slug: string;
    isPublished: boolean;
    publishedAt: string | null;
    createdAt: string;
  }>;
  mediaFiles: Array<{
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    createdAt: string;
  }>;
  features: SiteFeature[];
  _count: {
    pages: number;
    blogPosts: number;
    mediaFiles: number;
    users: number;
  };
};

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  image?: string | null;
};
