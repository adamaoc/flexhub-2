export interface DevisionMediaBooking {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  eventDate: Date;
  eventType: DevisionEventType;
  location?: string | null;
  description: string;
  howDidYouHear?: DevisionReferralSource | null;
  preferredContact: DevisionContactMethod;
  status: DevisionBookingStatus;
  contacted: boolean;
  completed: boolean;
  confirmationNumber?: string | null;
  notes?: string | null;
  quoteAmount?: number | null;
  quoteSent: boolean;
  quoteSentAt?: Date | null;
  depositPaid: boolean;
  depositAmount?: number | null;
  finalPaymentPaid: boolean;
  finalPaymentAmount?: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDevisionBookingInput {
  fullName: string;
  email: string;
  phone?: string;
  eventDate: Date;
  eventType: DevisionEventType;
  location?: string;
  description: string;
  howDidYouHear?: DevisionReferralSource;
  preferredContact: DevisionContactMethod;
}

export interface UpdateDevisionBookingInput {
  fullName?: string;
  email?: string;
  phone?: string;
  eventDate?: Date;
  eventType?: DevisionEventType;
  location?: string;
  description?: string;
  howDidYouHear?: DevisionReferralSource;
  preferredContact?: DevisionContactMethod;
  status?: DevisionBookingStatus;
  contacted?: boolean;
  completed?: boolean;
  confirmationNumber?: string;
  notes?: string;
  quoteAmount?: number;
  quoteSent?: boolean;
  quoteSentAt?: Date;
  depositPaid?: boolean;
  depositAmount?: number;
  finalPaymentPaid?: boolean;
  finalPaymentAmount?: number;
}

// Event Types
export enum DevisionEventType {
  WEDDING = "WEDDING",
  CORPORATE_EVENT = "CORPORATE_EVENT",
  PORTRAIT_SESSION = "PORTRAIT_SESSION",
  FAMILY_SESSION = "FAMILY_SESSION",
  ENGAGEMENT = "ENGAGEMENT",
  BIRTHDAY = "BIRTHDAY",
  ANNIVERSARY = "ANNIVERSARY",
  GRADUATION = "GRADUATION",
  REAL_ESTATE = "REAL_ESTATE",
  PRODUCT_PHOTOGRAPHY = "PRODUCT_PHOTOGRAPHY",
  EVENT_PHOTOGRAPHY = "EVENT_PHOTOGRAPHY",
  VIDEO_PRODUCTION = "VIDEO_PRODUCTION",
  OTHER = "OTHER",
}

// Referral Sources
export enum DevisionReferralSource {
  GOOGLE_SEARCH = "GOOGLE_SEARCH",
  SOCIAL_MEDIA = "SOCIAL_MEDIA",
  FRIEND_RECOMMENDATION = "FRIEND_RECOMMENDATION",
  PREVIOUS_CLIENT = "PREVIOUS_CLIENT",
  WEDDING_VENDOR = "WEDDING_VENDOR",
  BUSINESS_REFERRAL = "BUSINESS_REFERRAL",
  YELP_REVIEW = "YELP_REVIEW",
  FACEBOOK_ADS = "FACEBOOK_ADS",
  INSTAGRAM_ADS = "INSTAGRAM_ADS",
  OTHER = "OTHER",
}

// Contact Methods
export enum DevisionContactMethod {
  EMAIL = "EMAIL",
  PHONE = "PHONE",
  TEXT = "TEXT",
  WHATSAPP = "WHATSAPP",
  FACEBOOK_MESSENGER = "FACEBOOK_MESSENGER",
  INSTAGRAM_DM = "INSTAGRAM_DM",
}

// Booking Status
export enum DevisionBookingStatus {
  PENDING = "PENDING",
  CONTACTED = "CONTACTED",
  CONFIRMED = "CONFIRMED",
  DEPOSIT_PAID = "DEPOSIT_PAID",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  NO_SHOW = "NO_SHOW",
}

// Human-readable labels for enums
export const EVENT_TYPE_LABELS: Record<DevisionEventType, string> = {
  [DevisionEventType.WEDDING]: "Wedding",
  [DevisionEventType.CORPORATE_EVENT]: "Corporate Event",
  [DevisionEventType.PORTRAIT_SESSION]: "Portrait Session",
  [DevisionEventType.FAMILY_SESSION]: "Family Session",
  [DevisionEventType.ENGAGEMENT]: "Engagement",
  [DevisionEventType.BIRTHDAY]: "Birthday",
  [DevisionEventType.ANNIVERSARY]: "Anniversary",
  [DevisionEventType.GRADUATION]: "Graduation",
  [DevisionEventType.REAL_ESTATE]: "Real Estate",
  [DevisionEventType.PRODUCT_PHOTOGRAPHY]: "Product Photography",
  [DevisionEventType.EVENT_PHOTOGRAPHY]: "Event Photography",
  [DevisionEventType.VIDEO_PRODUCTION]: "Video Production",
  [DevisionEventType.OTHER]: "Other",
};

export const REFERRAL_SOURCE_LABELS: Record<DevisionReferralSource, string> = {
  [DevisionReferralSource.GOOGLE_SEARCH]: "Google Search",
  [DevisionReferralSource.SOCIAL_MEDIA]: "Social Media",
  [DevisionReferralSource.FRIEND_RECOMMENDATION]: "Friend Recommendation",
  [DevisionReferralSource.PREVIOUS_CLIENT]: "Previous Client",
  [DevisionReferralSource.WEDDING_VENDOR]: "Wedding Vendor",
  [DevisionReferralSource.BUSINESS_REFERRAL]: "Business Referral",
  [DevisionReferralSource.YELP_REVIEW]: "Yelp Review",
  [DevisionReferralSource.FACEBOOK_ADS]: "Facebook Ads",
  [DevisionReferralSource.INSTAGRAM_ADS]: "Instagram Ads",
  [DevisionReferralSource.OTHER]: "Other",
};

export const CONTACT_METHOD_LABELS: Record<DevisionContactMethod, string> = {
  [DevisionContactMethod.EMAIL]: "Email",
  [DevisionContactMethod.PHONE]: "Phone",
  [DevisionContactMethod.TEXT]: "Text",
  [DevisionContactMethod.WHATSAPP]: "WhatsApp",
  [DevisionContactMethod.FACEBOOK_MESSENGER]: "Facebook Messenger",
  [DevisionContactMethod.INSTAGRAM_DM]: "Instagram DM",
};

export const BOOKING_STATUS_LABELS: Record<DevisionBookingStatus, string> = {
  [DevisionBookingStatus.PENDING]: "Pending",
  [DevisionBookingStatus.CONTACTED]: "Contacted",
  [DevisionBookingStatus.CONFIRMED]: "Confirmed",
  [DevisionBookingStatus.DEPOSIT_PAID]: "Deposit Paid",
  [DevisionBookingStatus.SCHEDULED]: "Scheduled",
  [DevisionBookingStatus.IN_PROGRESS]: "In Progress",
  [DevisionBookingStatus.COMPLETED]: "Completed",
  [DevisionBookingStatus.CANCELLED]: "Cancelled",
  [DevisionBookingStatus.NO_SHOW]: "No Show",
};

// Status colors for UI
export const BOOKING_STATUS_COLORS: Record<DevisionBookingStatus, string> = {
  [DevisionBookingStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [DevisionBookingStatus.CONTACTED]: "bg-blue-100 text-blue-800",
  [DevisionBookingStatus.CONFIRMED]: "bg-green-100 text-green-800",
  [DevisionBookingStatus.DEPOSIT_PAID]: "bg-purple-100 text-purple-800",
  [DevisionBookingStatus.SCHEDULED]: "bg-indigo-100 text-indigo-800",
  [DevisionBookingStatus.IN_PROGRESS]: "bg-orange-100 text-orange-800",
  [DevisionBookingStatus.COMPLETED]: "bg-green-100 text-green-800",
  [DevisionBookingStatus.CANCELLED]: "bg-red-100 text-red-800",
  [DevisionBookingStatus.NO_SHOW]: "bg-gray-100 text-gray-800",
};

// Filter and search options
export interface DevisionBookingFilters {
  status?: DevisionBookingStatus;
  eventType?: DevisionEventType;
  contacted?: boolean;
  completed?: boolean;
  search?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Sort options
export type DevisionBookingSortBy =
  | "createdAt"
  | "updatedAt"
  | "eventDate"
  | "fullName"
  | "status"
  | "eventType";

export type SortOrder = "asc" | "desc";

export interface DevisionBookingSortOptions {
  sortBy: DevisionBookingSortBy;
  sortOrder: SortOrder;
}
