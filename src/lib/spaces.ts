import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// DigitalOcean Spaces configuration
const REGION = process.env.DO_SPACES_REGION || "nyc3";
const spacesConfig = {
  region: "us-east-1", // Required by AWS SDK for DigitalOcean Spaces
  endpoint: `https://${REGION}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY || "",
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY || "",
  },
};

const s3Client = new S3Client(spacesConfig);
const BUCKET_NAME = process.env.DO_SPACES_BUCKET || "";
const SPACES_ENDPOINT = process.env.DO_SPACES_ENDPOINT || "";

export async function uploadToSpaces(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  if (!BUCKET_NAME || !SPACES_ENDPOINT) {
    throw new Error("DigitalOcean Spaces configuration is missing");
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: "public-read", // Make the file publicly accessible
  });

  await s3Client.send(command);

  // Return the public URL
  return `${SPACES_ENDPOINT}/${key}`;
}

export async function deleteFromSpaces(key: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("DigitalOcean Spaces configuration is missing");
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

export function getSpacesKeyFromUrl(url: string): string | null {
  if (!SPACES_ENDPOINT) return null;

  const prefix = `${SPACES_ENDPOINT}/`;
  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }
  return null;
}

export function isSpacesUrl(url: string): boolean {
  return SPACES_ENDPOINT ? url.startsWith(SPACES_ENDPOINT) : false;
}

export function generateSpacesKey(
  siteId: string,
  imageType: string,
  filename: string
): string {
  return `flexhub/sites/${siteId}/${imageType}-${Date.now()}-${filename}`;
}

// Media file utilities
export function sanitizeSiteName(siteName: string): string {
  // Remove or replace special characters, keep only alphanumeric and hyphens
  return siteName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

export function generateMediaFileKey(
  siteId: string,
  siteName: string,
  filename: string,
  folderPath?: string
): string {
  const sanitizedSiteName = sanitizeSiteName(siteName);
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

  // Base path: flexhub/media/{sanitized-site-name}
  let key = `flexhub/media/${sanitizedSiteName}`;

  // Add folder path if provided
  if (folderPath) {
    // Sanitize folder path
    const sanitizedFolderPath = folderPath
      .split("/")
      .map((folder) => folder.replace(/[^a-zA-Z0-9.-]/g, "_"))
      .join("/");
    key += `/${sanitizedFolderPath}`;
  }

  // Add timestamped filename
  key += `/${timestamp}-${sanitizedFilename}`;

  return key;
}

export function getMediaFolderStructure(key: string): {
  siteName: string;
  folderPath: string | null;
  filename: string;
} | null {
  // Extract info from key: flexhub/media/{site-name}/{optional-folders}/{filename}
  const match = key.match(/^flexhub\/media\/([^\/]+)\/(.+)$/);
  if (!match) return null;

  const siteName = match[1];
  const fullPath = match[2];

  // Split path to get folder structure and filename
  const pathParts = fullPath.split("/");
  const filename = pathParts[pathParts.length - 1];

  // Check if there are folder parts (more than just the filename)
  const folderPath =
    pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : null;

  return {
    siteName,
    folderPath,
    filename,
  };
}
