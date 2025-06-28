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
