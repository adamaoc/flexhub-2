# FlexHub Public API Documentation

## Overview

The FlexHub Public API provides access to basic information about all stores/sites managed by the FlexHub CMS. This API is designed for external integrations and does not require authentication.

## Base URL

- **Development**: `http://localhost:3005`
- **Production**: `https://your-flexhub-domain.com`

## Endpoints

### Get All Sites

**Endpoint**: `GET /api/public/sites`

**Description**: Returns a list of all sites managed by FlexHub with their basic details and enabled features.

**CORS Support**: ✅ Enabled for cross-origin requests

**Caching**: 10 minutes (600 seconds) with stale-while-revalidate

#### Response Format

```json
{
  "sites": [
    {
      "id": "string",
      "name": "string",
      "description": "string | null",
      "domain": "string | null",
      "logo": "string | null",
      "coverImage": "string | null",
      "features": [
        {
          "id": "string",
          "type": "FeatureType",
          "displayName": "string",
          "description": "string",
          "config": "object | null"
        }
      ],
      "createdAt": "ISO 8601 datetime",
      "updatedAt": "ISO 8601 datetime"
    }
  ],
  "count": "number",
  "lastUpdated": "ISO 8601 datetime"
}
```

#### Feature Types

The following feature types are available:

- `PAGES` - Static page management
- `BLOG_POSTS` - Blog content management
- `MEDIA_FILES` - Media file management
- `EMAIL_MANAGEMENT` - Email campaign management
- `CONTACT_MANAGEMENT` - Contact form management
- `SPONSORS` - Sponsor relationship management
- `ONLINE_STORE` - E-commerce functionality
- `NEWSLETTER` - Newsletter management
- `ANALYTICS` - Site analytics
- `SEO_TOOLS` - SEO optimization tools
- `SOCIAL_MEDIA_INTEGRATION` - Social media integration
- `MULTI_LANGUAGE` - Multi-language support
- `CUSTOM_FORMS` - Custom form builder
- `MEMBER_AREA` - Member/user area management
- `EVENT_MANAGEMENT` - Event management

#### Example Request

```bash
curl -X GET "http://localhost:3005/api/public/sites" \
     -H "Content-Type: application/json" \
     -H "Origin: http://localhost:3232"
```

#### Example Response

```json
{
  "sites": [
    {
      "id": "8ad1bc58-fdb0-44ac-b021-251a06bd2bec",
      "name": "ampnet media",
      "description": "Marketing site for ampnet (media)",
      "domain": "ampnet.media",
      "logo": null,
      "coverImage": null,
      "features": [
        {
          "id": "b589141a-d0c4-427e-aee3-4f23c1c0a060",
          "type": "BLOG_POSTS",
          "displayName": "Blog Posts",
          "description": "Publish and manage blog content",
          "config": null
        },
        {
          "id": "ec4fc468-f2a8-466e-8169-ced5a626bfe5",
          "type": "EMAIL_MANAGEMENT",
          "displayName": "Email Management",
          "description": "Manage email campaigns and templates",
          "config": null
        }
      ],
      "createdAt": "2025-06-29T16:00:23.629Z",
      "updatedAt": "2025-06-29T16:00:23.629Z"
    }
  ],
  "count": 1,
  "lastUpdated": "2025-06-29T16:13:16.328Z"
}
```

## CORS Configuration

CORS is enabled centrally via the app’s headers configuration for all /api/public/* routes. You can make cross-origin requests without setting special headers on individual endpoints.

## Rate Limiting & Caching

- **Caching**: Responses are cached for 10 minutes with stale-while-revalidate for 5 minutes
- **Rate Limiting**: No explicit rate limiting is currently implemented

## Error Handling

The API returns standard HTTP status codes:

- **200**: Success
- **500**: Internal Server Error

Error responses follow this format:

```json
{
  "error": "Error message",
  "sites": [],
  "count": 0
}
```

## Data Privacy

This API only exposes public information:

- ✅ Site basic details (name, description, domain, images)
- ✅ Enabled features and their configurations
- ❌ User information
- ❌ Internal site management data
- ❌ Contact form submissions
- ❌ Private configuration data

## Integration Example

### JavaScript/Fetch

```javascript
async function fetchFlexHubSites() {
  try {
    const response = await fetch("http://localhost:3005/api/public/sites", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3232",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.sites;
  } catch (error) {
    console.error("Failed to fetch FlexHub sites:", error);
    return [];
  }
}

// Usage
fetchFlexHubSites().then((sites) => {
  console.log("FlexHub Sites:", sites);
  sites.forEach((site) => {
    console.log(`${site.name} - ${site.domain}`);
    console.log(
      "Features:",
      site.features.map((f) => f.displayName).join(", ")
    );
  });
});
```

### Node.js/Express

```javascript
const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.get("/flexhub-sites", async (req, res) => {
  try {
    const response = await fetch("http://localhost:3005/api/public/sites");
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching FlexHub sites:", error);
    res.status(500).json({ error: "Failed to fetch sites" });
  }
});
```

## Support

For questions or issues with this API, please contact the FlexHub development team.
