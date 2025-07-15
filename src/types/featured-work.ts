export interface FeaturedWork {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  thumbnail?: string | null;
  isVideo: boolean;
  images: string[];
  videoUrl?: string | null;
  clientName?: string | null;
  projectDate?: Date | null;
  tags: string[];
  isFeatured: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFeaturedWorkInput {
  title: string;
  description?: string;
  category: string;
  thumbnail?: string;
  isVideo?: boolean;
  images?: string[];
  videoUrl?: string;
  clientName?: string;
  projectDate?: Date;
  tags?: string[];
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface UpdateFeaturedWorkInput {
  title?: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  isVideo?: boolean;
  images?: string[];
  videoUrl?: string;
  clientName?: string;
  projectDate?: Date;
  tags?: string[];
  isFeatured?: boolean;
  sortOrder?: number;
}

// Common categories for videography/photography work
export const FEATURED_WORK_CATEGORIES = [
  "Wedding",
  "Corporate",
  "Event",
  "Portrait",
  "Commercial",
  "Documentary",
  "Music Video",
  "Real Estate",
  "Product",
  "Fashion",
  "Sports",
  "Travel",
  "Food",
  "Architecture",
  "Other",
] as const;

export type FeaturedWorkCategory = (typeof FEATURED_WORK_CATEGORIES)[number];

// Filter and search options
export interface FeaturedWorkFilters {
  category?: string;
  isVideo?: boolean;
  isFeatured?: boolean;
  clientName?: string;
  tags?: string[];
  search?: string;
}

// Sort options
export type FeaturedWorkSortBy =
  | "createdAt"
  | "updatedAt"
  | "projectDate"
  | "title"
  | "sortOrder"
  | "isFeatured";

export type SortOrder = "asc" | "desc";

export interface FeaturedWorkSortOptions {
  sortBy: FeaturedWorkSortBy;
  sortOrder: SortOrder;
}
