import { NextResponse } from "next/server";

// Define all available features with their display information
// This matches the data we populated in the database migration
const FEATURE_DEFINITIONS = [
  {
    value: "PAGES",
    label: "Pages",
    description: "Create and manage static pages",
  },
  {
    value: "BLOG_POSTS",
    label: "Blog Posts",
    description: "Publish and manage blog content",
  },
  {
    value: "MEDIA_FILES",
    label: "Media Files",
    description: "Upload and manage media files",
  },
  {
    value: "EMAIL_MANAGEMENT",
    label: "Email Management",
    description: "Manage email campaigns and templates",
  },
  {
    value: "CONTACT_MANAGEMENT",
    label: "Contact Management",
    description: "Manage contact forms and inquiries",
  },
  {
    value: "SPONSORS",
    label: "Sponsors",
    description: "Manage sponsor relationships and content",
  },
  {
    value: "ONLINE_STORE",
    label: "Online Store",
    description: "E-commerce functionality",
  },
  {
    value: "NEWSLETTER",
    label: "Newsletter",
    description: "Newsletter subscription and management",
  },
  {
    value: "ANALYTICS",
    label: "Analytics",
    description: "Site analytics and reporting",
  },
  {
    value: "SEO_TOOLS",
    label: "SEO Tools",
    description: "Search engine optimization tools",
  },
  {
    value: "SOCIAL_MEDIA_INTEGRATION",
    label: "Social Media Integration",
    description: "Connect with social media platforms",
  },
  {
    value: "MULTI_LANGUAGE",
    label: "Multi Language",
    description: "Multi-language content support",
  },
  {
    value: "CUSTOM_FORMS",
    label: "Custom Forms",
    description: "Create custom forms and surveys",
  },
  {
    value: "MEMBER_AREA",
    label: "Member Area",
    description: "Member-only content and features",
  },
  {
    value: "EVENT_MANAGEMENT",
    label: "Event Management",
    description: "Manage events and registrations",
  },
];

export async function GET() {
  try {
    return NextResponse.json({
      features: FEATURE_DEFINITIONS,
    });
  } catch (error) {
    console.error("Error fetching feature definitions:", error);
    return NextResponse.json(
      { error: "Failed to fetch feature definitions" },
      { status: 500 }
    );
  }
}
