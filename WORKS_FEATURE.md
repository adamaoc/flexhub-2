# Works Feature Implementation

## Overview

The Works feature allows FlexHub sites to showcase portfolio work and projects. This feature provides a complete solution for displaying professional work, project details, and creating an impressive portfolio presentation that can be accessed both through the admin interface and via a public API for external websites.

## Database Schema

### New Models Added

1. **Work** - Stores individual portfolio works/projects
   - Comprehensive project details (title, description, category, type)
   - Client information and project metadata
   - Technology stack and project duration
   - Results and measurable outcomes
   - Multiple URL types (project, GitHub, video)
   - Featured status for homepage highlighting
   - Image support for visual presentation

### Enums Added

- **WorkCategory**: WEBSITE, VIDEO, CLI_TOOL, SEO, SOCIAL_MEDIA, ADVERTISING, DESIGN, CONSULTING
- **WorkType**: WORK, WEBSITE

## API Endpoints

### Admin Endpoints (Protected)

#### Works Management

- `GET /api/sites/[siteId]/works` - List all works with filtering and search
- `POST /api/sites/[siteId]/works` - Create new work
- `GET /api/sites/[siteId]/works/[workId]` - Get specific work
- `PUT /api/sites/[siteId]/works/[workId]` - Update work
- `DELETE /api/sites/[siteId]/works/[workId]` - Delete work

### Public Endpoints

- `GET /api/public/sites/[siteId]/works` - Get public works with search and filters

## Admin Interface

### Works Manager (`/works`)

- **Portfolio Overview**: Grid view of all works with visual cards
- **Advanced Filtering**: Filter by category, featured status, and search
- **Rich Work Editor**: Comprehensive form for all work details
- **Visual Management**: Image preview and category icons
- **Status Management**: Featured/unfeatured toggle
- **Quick Actions**: Edit, delete, and external link access
- **Technology Tags**: Visual display of technologies used
- **Project Details**: Client, duration, results, and links management

### Work Form Fields

1. **Basic Information**

   - Title (required)
   - Category (required) - Dropdown with 8 categories
   - Description (required) - Rich text area
   - Type (required) - Work or Website
   - Date (required) - Project completion date

2. **Project Details**

   - Client name (optional)
   - Duration (optional) - e.g., "2 weeks", "3 months"
   - Technologies (optional) - Comma-separated list
   - Results/Outcomes (optional) - Measurable results

3. **Media & Links**

   - Image URL (optional) - Project screenshot/preview
   - Logo URL (optional) - Company/client logo
   - Project URL (optional) - Live project link
   - GitHub URL (optional) - Source code repository
   - Video URL (optional) - Demo or presentation video

4. **Display Options**
   - Featured (boolean) - Show on homepage/priority display

## Public API Features

### Search and Filtering

The public API supports comprehensive search and filtering:

- **Text Search**: Search by title, description, client, technologies, or results
- **Category Filter**: Filter by work category (website, video, design, etc.)
- **Type Filter**: Filter by work type (work vs website)
- **Client Filter**: Filter by specific client
- **Technology Filter**: Filter by specific technology
- **Featured Filter**: Filter by featured status
- **Pagination**: Support for paginated results

### Response Format

```json
{
  "works": [
    {
      "id": "work-uuid",
      "title": "E-commerce Platform Redesign",
      "category": "WEBSITE",
      "image": "https://example.com/project-image.jpg",
      "logo": "https://example.com/client-logo.png",
      "description": "Complete redesign and development of...",
      "type": "WORK",
      "date": "2024-01-15T00:00:00Z",
      "client": "Tech Corp",
      "featured": true,
      "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL"],
      "duration": "3 months",
      "results": "Increased conversion rate by 35% and reduced bounce rate by 20%",
      "githubUrl": "https://github.com/user/ecommerce-platform",
      "videoUrl": "https://youtube.com/watch?v=demo",
      "url": "https://techcorp-store.com",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 25,
    "pages": 2
  },
  "filters": {
    "categories": ["WEBSITE", "DESIGN", "SEO"],
    "clients": ["Tech Corp", "Design Studio", "Local Business"],
    "technologies": ["React", "TypeScript", "Node.js", "Figma", "WordPress"]
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Integration Guide

### For External Websites

1. **Get your Site ID** from the FlexHub admin panel
2. **Use the public API**: `https://your-flexhub-domain/api/public/sites/[SITE_ID]/works`
3. **Add query parameters** for filtering and search:

```javascript
// Example API calls
const baseUrl =
  "https://your-flexhub-domain/api/public/sites/YOUR_SITE_ID/works";

// Get all works
const allWorks = await fetch(baseUrl);

// Search for specific works
const searchWorks = await fetch(`${baseUrl}?search=ecommerce`);

// Filter by category and featured status
const featuredWebsites = await fetch(
  `${baseUrl}?category=WEBSITE&featured=true`
);

// Filter by technology
const reactProjects = await fetch(`${baseUrl}?technology=React`);

// Get paginated results
const pageWorks = await fetch(`${baseUrl}?page=2&limit=10`);
```

### HTML Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Portfolio Works</title>
    <style>
      .works-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
      }
      .work-card {
        border: 1px solid #ddd;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
      }
      .work-card:hover {
        transform: translateY(-2px);
      }
      .work-image {
        width: 100%;
        height: 200px;
        object-fit: cover;
        background-color: #f5f5f5;
      }
      .work-content {
        padding: 20px;
      }
      .work-title {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 8px;
      }
      .work-category {
        display: inline-block;
        background-color: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        margin-bottom: 8px;
      }
      .work-description {
        color: #666;
        margin-bottom: 12px;
        line-height: 1.4;
      }
      .work-meta {
        font-size: 0.9em;
        color: #888;
        margin-bottom: 8px;
      }
      .work-technologies {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        margin-bottom: 12px;
      }
      .tech-tag {
        background-color: #f0f0f0;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
      }
      .work-links {
        display: flex;
        gap: 8px;
      }
      .work-link {
        padding: 6px 12px;
        background-color: #1976d2;
        color: white;
        text-decoration: none;
        border-radius: 4px;
        font-size: 0.9em;
      }
      .work-link:hover {
        background-color: #1565c0;
      }
      .featured-badge {
        background-color: #ff9800;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8em;
        position: absolute;
        top: 10px;
        right: 10px;
      }
      .filters {
        padding: 20px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .filter-input,
      .filter-select {
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1 style="text-align: center; margin: 20px 0;">Portfolio Works</h1>

    <div class="filters">
      <input
        type="text"
        id="search"
        placeholder="Search works..."
        class="filter-input"
      />
      <select id="category" class="filter-select">
        <option value="">All Categories</option>
        <option value="WEBSITE">Website</option>
        <option value="VIDEO">Video</option>
        <option value="DESIGN">Design</option>
        <option value="SEO">SEO</option>
        <option value="SOCIAL_MEDIA">Social Media</option>
      </select>
      <select id="featured" class="filter-select">
        <option value="">All Works</option>
        <option value="true">Featured Only</option>
      </select>
      <button onclick="loadWorks()">Search</button>
    </div>

    <div id="works" class="works-grid"></div>
    <div id="pagination" style="text-align: center; margin: 20px;"></div>

    <script>
      const SITE_ID = "YOUR_SITE_ID"; // Replace with your site ID
      const API_BASE = `https://your-flexhub-domain/api/public/sites/${SITE_ID}/works`;

      async function loadWorks(page = 1) {
        const search = document.getElementById("search").value;
        const category = document.getElementById("category").value;
        const featured = document.getElementById("featured").value;

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });

        if (search) params.append("search", search);
        if (category) params.append("category", category);
        if (featured) params.append("featured", featured);

        try {
          const response = await fetch(`${API_BASE}?${params}`);
          const data = await response.json();

          displayWorks(data.works);
          displayPagination(data.pagination);
        } catch (error) {
          console.error("Error loading works:", error);
          document.getElementById("works").innerHTML =
            "<p>Error loading works</p>";
        }
      }

      function displayWorks(works) {
        const container = document.getElementById("works");
        container.innerHTML = "";

        works.forEach((work) => {
          const workElement = document.createElement("div");
          workElement.className = "work-card";

          const categoryIcon = getCategoryIcon(work.category);
          const formattedDate = new Date(work.date).toLocaleDateString();

          workElement.innerHTML = `
                    <div style="position: relative;">
                        ${
                          work.featured
                            ? '<div class="featured-badge">⭐ Featured</div>'
                            : ""
                        }
                        ${
                          work.image
                            ? `<img src="${work.image}" alt="${work.title}" class="work-image">`
                            : '<div class="work-image" style="display: flex; align-items: center; justify-content: center; font-size: 3em;">' +
                              categoryIcon +
                              "</div>"
                        }
                    </div>
                    <div class="work-content">
                        <div class="work-title">${work.title}</div>
                        <div class="work-category">${categoryIcon} ${work.category.replace(
            "_",
            " "
          )}</div>
                        <div class="work-description">${work.description.substring(
                          0,
                          120
                        )}...</div>
                        
                        <div class="work-meta">
                            <div>📅 ${formattedDate}</div>
                            ${work.client ? `<div>👤 ${work.client}</div>` : ""}
                            ${
                              work.duration
                                ? `<div>⏱️ ${work.duration}</div>`
                                : ""
                            }
                        </div>
                        
                        ${
                          work.technologies.length > 0
                            ? `
                            <div class="work-technologies">
                                ${work.technologies
                                  .slice(0, 4)
                                  .map(
                                    (tech) =>
                                      `<span class="tech-tag">${tech}</span>`
                                  )
                                  .join("")}
                                ${
                                  work.technologies.length > 4
                                    ? `<span class="tech-tag">+${
                                        work.technologies.length - 4
                                      } more</span>`
                                    : ""
                                }
                            </div>
                        `
                            : ""
                        }
                        
                        <div class="work-links">
                            ${
                              work.url
                                ? `<a href="${work.url}" target="_blank" class="work-link">🔗 View Project</a>`
                                : ""
                            }
                            ${
                              work.githubUrl
                                ? `<a href="${work.githubUrl}" target="_blank" class="work-link">💻 GitHub</a>`
                                : ""
                            }
                            ${
                              work.videoUrl
                                ? `<a href="${work.videoUrl}" target="_blank" class="work-link">🎥 Video</a>`
                                : ""
                            }
                        </div>
                    </div>
                `;

          container.appendChild(workElement);
        });
      }

      function getCategoryIcon(category) {
        const icons = {
          WEBSITE: "🌐",
          VIDEO: "🎥",
          CLI_TOOL: "⚡",
          SEO: "🔍",
          SOCIAL_MEDIA: "📱",
          ADVERTISING: "📢",
          DESIGN: "🎨",
          CONSULTING: "💼",
        };
        return icons[category] || "📂";
      }

      function displayPagination(pagination) {
        const container = document.getElementById("pagination");
        container.innerHTML = "";

        if (pagination.pages > 1) {
          for (let i = 1; i <= pagination.pages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.style.margin = "0 5px";
            button.style.padding = "8px 12px";
            button.style.border =
              i === pagination.page ? "2px solid #1976d2" : "1px solid #ddd";
            button.style.backgroundColor =
              i === pagination.page ? "#1976d2" : "white";
            button.style.color = i === pagination.page ? "white" : "black";
            button.style.cursor = "pointer";
            button.style.borderRadius = "4px";
            button.onclick = () => loadWorks(i);
            container.appendChild(button);
          }
        }
      }

      // Load works on page load
      loadWorks();
    </script>
  </body>
</html>
```

## Security Features

1. **Authentication**: Admin endpoints require valid session authentication
2. **Authorization**: Users can only access data for sites they have permission to manage
3. **CORS**: Public endpoint supports CORS for cross-origin requests
4. **Input Validation**: Server-side validation of required fields and enums
5. **Rate Limiting**: Built-in protection against spam (inherits from Next.js)
6. **Data Sanitization**: Input data is validated and sanitized

## Setup and Migration

### Database Migration

The works feature was added via migration:

```bash
npx prisma migrate dev --name add_works_feature
```

### Setup Script

Add works feature to existing sites:

```bash
npx ts-node scripts/add-works-feature.ts
```

## Features and Benefits

### For Site Owners:

- **Professional Portfolio**: Showcase work in a professional, organized manner
- **Comprehensive Details**: Include all relevant project information
- **Visual Appeal**: Support for project images and visual categorization
- **Flexible Organization**: Multiple categories and filtering options
- **Client Management**: Track and display client work
- **Results Tracking**: Document measurable project outcomes
- **Featured Works**: Highlight best work for priority display

### For Developers:

- **RESTful API**: Clean, consistent API design
- **Type Safe**: Full TypeScript support with Prisma
- **Searchable**: Comprehensive search and filtering capabilities
- **CORS Enabled**: Ready for cross-origin integration
- **Well Documented**: Complete API documentation and examples
- **Extensible**: Easy to add new work categories or fields

### For End Users:

- **User Friendly**: Intuitive portfolio browsing experience
- **Searchable**: Find specific works by technology, category, or keywords
- **Filterable**: Multiple filtering options for easy navigation
- **Mobile Friendly**: Responsive design for all devices
- **Fast**: Optimized for performance with caching
- **Interactive**: Direct links to projects, code, and videos

## Navigation

The Works feature is accessible through:

- **Works Page**: `/works`
- **Sidebar Navigation**: Available when WORKS feature is enabled
- **Feature Guard**: Shows appropriate messaging when feature is disabled

## File Structure

```
src/
├── app/
│   ├── works/page.tsx                          # Main works page
│   └── api/
│       ├── sites/[siteId]/
│       │   └── works/                          # Works management
│       │       ├── route.ts                    # CRUD operations
│       │       └── [workId]/route.ts           # Individual work operations
│       └── public/sites/[siteId]/works/route.ts # Public API
├── components/
│   └── WorksManager.tsx                        # Main works management component
├── scripts/
│   └── add-works-feature.ts                    # Setup script
└── prisma/
    └── schema.prisma                           # Updated with Work model
```

## Next Steps

Potential enhancements:

1. **Image Upload**: Direct image upload instead of URL-only
2. **Advanced Gallery**: Multiple images per work with gallery view
3. **Work Templates**: Pre-built work templates for common project types
4. **Analytics**: Track work views and engagement
5. **Export**: Export portfolio as PDF or other formats
6. **Integration**: Webhook support for portfolio updates
7. **Advanced Search**: Full-text search with relevance scoring
8. **Work Collections**: Group related works into collections/series
9. **Testimonials**: Client testimonials linked to specific works
10. **Timeline View**: Display works in timeline format
11. **Skills Extraction**: Automatic skill extraction from technologies
12. **Work Comparison**: Side-by-side work comparison features
