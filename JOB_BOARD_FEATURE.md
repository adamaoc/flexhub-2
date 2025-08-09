# Job Board Feature Implementation

## Overview

The Job Board feature allows FlexHub sites to create and manage job listings with company profiles. This feature provides a complete solution for posting jobs, managing companies, and exposing job data through a public API for external websites.

## Database Schema

### New Models Added

1. **Company** - Stores company profiles for job listings

   - Basic company information (name, description, website, logo)
   - Location, industry, size, and founding year
   - Active/inactive status for filtering

2. **JobListing** - Stores individual job postings
   - Comprehensive job details (title, description, requirements, benefits)
   - Job type, status, experience level, and remote work type
   - Salary range with currency support
   - Application URL and optional job image
   - Expiration date for automatic status management

### Enums Added

- **JobType**: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, TEMPORARY, VOLUNTEER
- **JobStatus**: ACTIVE, INACTIVE, EXPIRED, FILLED
- **ExperienceLevel**: ENTRY_LEVEL, JUNIOR, MID_LEVEL, SENIOR, EXECUTIVE
- **RemoteWorkType**: ON_SITE, REMOTE, HYBRID

## API Endpoints

### Admin Endpoints (Protected)

#### Companies Management

- `GET /api/sites/[siteId]/companies` - List all companies
- `POST /api/sites/[siteId]/companies` - Create new company
- `GET /api/sites/[siteId]/companies/[companyId]` - Get specific company
- `PUT /api/sites/[siteId]/companies/[companyId]` - Update company
- `DELETE /api/sites/[siteId]/companies/[companyId]` - Delete company

#### Job Listings Management

- `GET /api/sites/[siteId]/job-listings` - List job listings with filtering
- `POST /api/sites/[siteId]/job-listings` - Create new job listing
- `GET /api/sites/[siteId]/job-listings/[jobListingId]` - Get specific job listing
- `PUT /api/sites/[siteId]/job-listings/[jobListingId]` - Update job listing
- `DELETE /api/sites/[siteId]/job-listings/[jobListingId]` - Delete job listing

### Public Endpoints

- `GET /api/public/sites/[siteId]/job-board` - Get public job listings with search and filters

## Admin Interface

### Job Board Manager (`/job-board`)

- **Companies Tab**: Manage company profiles

  - Add/edit/delete companies
  - Company logo and website management
  - Company details (location, industry, size, founding year)
  - Active/inactive status toggle

- **Job Listings Tab**: Manage job postings
  - Create/edit/delete job listings
  - Rich text descriptions and requirements
  - Job type, experience level, and remote work type selection
  - Salary range with currency options
  - Application URL and job image support
  - Expiration date management

## Public API Features

### Search and Filtering

The public API supports comprehensive search and filtering:

- **Text Search**: Search by job title, description, location, company name, or industry
- **Job Type Filter**: Filter by full-time, part-time, contract, etc.
- **Company Filter**: Filter by specific company
- **Location Filter**: Filter by location
- **Experience Level Filter**: Filter by entry-level, junior, mid-level, etc.
- **Remote Work Filter**: Filter by on-site, remote, or hybrid
- **Salary Range Filter**: Filter by minimum and maximum salary
- **Pagination**: Support for paginated results

### Response Format

```json
{
  "jobListings": [
    {
      "id": "job-uuid",
      "title": "Senior Software Engineer",
      "description": "HTML content...",
      "requirements": "HTML content...",
      "benefits": "HTML content...",
      "jobType": "FULL_TIME",
      "status": "ACTIVE",
      "experienceLevel": "SENIOR",
      "remoteWorkType": "HYBRID",
      "salaryMin": 80000,
      "salaryMax": 120000,
      "salaryCurrency": "USD",
      "location": "San Francisco, CA",
      "applicationUrl": "https://example.com/apply",
      "image": "https://example.com/job-image.jpg",
      "expiresAt": "2024-12-31T23:59:59Z",
      "company": {
        "id": "company-uuid",
        "name": "Tech Corp",
        "logo": "https://example.com/logo.png",
        "location": "San Francisco, CA",
        "industry": "Technology",
        "website": "https://techcorp.com",
        "size": "100-500 employees"
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  },
  "filters": {
    "jobTypes": ["FULL_TIME", "PART_TIME"],
    "companies": [{ "id": "company-uuid", "name": "Tech Corp" }],
    "locations": ["San Francisco, CA", "New York, NY"],
    "experienceLevels": ["JUNIOR", "SENIOR"],
    "remoteWorkTypes": ["REMOTE", "HYBRID"]
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

## Integration Guide

### For External Websites

1. **Get your Site ID** from the FlexHub admin panel
2. **Use the public API**: `https://your-flexhub-domain/api/public/sites/[SITE_ID]/job-board`
3. **Add query parameters** for filtering and search:

```javascript
// Example API calls
const baseUrl =
  "https://your-flexhub-domain/api/public/sites/YOUR_SITE_ID/job-board";

// Get all jobs
const allJobs = await fetch(baseUrl);

// Search for specific jobs
const searchJobs = await fetch(`${baseUrl}?search=software engineer`);

// Filter by job type and location
const filteredJobs = await fetch(
  `${baseUrl}?jobType=FULL_TIME&location=San Francisco`
);

// Filter by salary range
const salaryJobs = await fetch(`${baseUrl}?salaryMin=80000&salaryMax=120000`);

// Get paginated results
const pageJobs = await fetch(`${baseUrl}?page=2&limit=10`);
```

### HTML Example

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Job Board</title>
    <style>
      .job-card {
        border: 1px solid #ddd;
        padding: 20px;
        margin: 10px 0;
        border-radius: 8px;
      }
      .company-logo {
        width: 50px;
        height: 50px;
        object-fit: cover;
        border-radius: 4px;
      }
      .salary {
        color: #22c55e;
        font-weight: bold;
      }
      .filters {
        margin-bottom: 20px;
      }
      .filter-input {
        margin: 5px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    </style>
  </head>
  <body>
    <h1>Job Board</h1>

    <div class="filters">
      <input
        type="text"
        id="search"
        placeholder="Search jobs..."
        class="filter-input"
      />
      <select id="jobType" class="filter-input">
        <option value="">All Job Types</option>
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="CONTRACT">Contract</option>
      </select>
      <input
        type="text"
        id="location"
        placeholder="Location"
        class="filter-input"
      />
      <button onclick="loadJobs()">Search</button>
    </div>

    <div id="jobs"></div>
    <div id="pagination"></div>

    <script>
      const SITE_ID = "YOUR_SITE_ID"; // Replace with your site ID
      const API_BASE = `https://your-flexhub-domain/api/public/sites/${SITE_ID}/job-board`;

      async function loadJobs(page = 1) {
        const search = document.getElementById("search").value;
        const jobType = document.getElementById("jobType").value;
        const location = document.getElementById("location").value;

        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (search) params.append("search", search);
        if (jobType) params.append("jobType", jobType);
        if (location) params.append("location", location);

        try {
          const response = await fetch(`${API_BASE}?${params}`);
          const data = await response.json();

          displayJobs(data.jobListings);
          displayPagination(data.pagination);
        } catch (error) {
          console.error("Error loading jobs:", error);
          document.getElementById("jobs").innerHTML =
            "<p>Error loading jobs</p>";
        }
      }

      function displayJobs(jobs) {
        const container = document.getElementById("jobs");
        container.innerHTML = "";

        jobs.forEach((job) => {
          const salary =
            job.salaryMin && job.salaryMax
              ? `${
                  job.salaryCurrency
                } ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
              : "Salary not specified";

          const card = document.createElement("div");
          card.className = "job-card";
          card.innerHTML = `
                    <div style="display: flex; align-items: start; gap: 15px;">
                        ${
                          job.company.logo
                            ? `<img src="${job.company.logo}" alt="${job.company.name}" class="company-logo">`
                            : ""
                        }
                        <div style="flex: 1;">
                            <h3>${job.title}</h3>
                            <p><strong>${job.company.name}</strong> - ${
            job.location || "Location not specified"
          }</p>
                            <p>${job.jobType.replace("_", " ")} • ${
            job.experienceLevel
              ? job.experienceLevel.replace("_", " ")
              : "Any level"
          }</p>
                            <p class="salary">${salary}</p>
                            <p>${job.description.substring(0, 200)}...</p>
                            ${
                              job.applicationUrl
                                ? `<a href="${job.applicationUrl}" target="_blank" style="color: #3b82f6;">Apply Now</a>`
                                : ""
                            }
                        </div>
                    </div>
                `;
          container.appendChild(card);
        });
      }

      function displayPagination(pagination) {
        const container = document.getElementById("pagination");
        container.innerHTML = "";

        if (pagination.pages > 1) {
          const paginationDiv = document.createElement("div");
          paginationDiv.style.textAlign = "center";
          paginationDiv.style.marginTop = "20px";

          for (let i = 1; i <= pagination.pages; i++) {
            const button = document.createElement("button");
            button.textContent = i;
            button.style.margin = "0 5px";
            button.style.padding = "8px 12px";
            button.style.border =
              i === pagination.page ? "2px solid #3b82f6" : "1px solid #ddd";
            button.style.backgroundColor =
              i === pagination.page ? "#3b82f6" : "white";
            button.style.color = i === pagination.page ? "white" : "black";
            button.style.cursor = "pointer";
            button.onclick = () => loadJobs(i);
            paginationDiv.appendChild(button);
          }

          container.appendChild(paginationDiv);
        }
      }

      // Load jobs on page load
      loadJobs();
    </script>
  </body>
</html>
```

## Security Features

1. **Authentication**: Admin endpoints require valid session authentication
2. **Authorization**: Users can only access data for sites they have permission to manage
3. **CORS**: Public endpoint supports CORS for cross-origin requests
4. **Input Validation**: Server-side validation of required fields
5. **Rate Limiting**: Built-in protection against spam (inherits from Next.js)
6. **Data Sanitization**: HTML content is properly handled

## Setup and Migration

### Database Migration

The job board feature was added via migration:

```bash
npx prisma migrate dev --name add_job_board
```

### Setup Script

Add job board feature to existing sites:

```bash
npx ts-node scripts/add-job-board-feature.ts
```

## Features and Benefits

### For Site Owners:

- **Easy Management**: Intuitive interface for managing companies and job listings
- **Rich Content**: Support for HTML descriptions, requirements, and benefits
- **Flexible Filtering**: Multiple job types, experience levels, and remote work options
- **Salary Support**: Salary ranges with currency options
- **Image Support**: Company logos and job listing images
- **Expiration Management**: Automatic status management for expired jobs

### For Developers:

- **RESTful API**: Clean, consistent API design
- **Type Safe**: Full TypeScript support
- **Searchable**: Comprehensive search and filtering capabilities
- **CORS Enabled**: Ready for cross-origin integration
- **Well Documented**: Complete API documentation and examples

### For End Users:

- **User Friendly**: Clean, responsive job board interface
- **Searchable**: Find jobs by title, company, location, or keywords
- **Filterable**: Filter by job type, experience level, salary, etc.
- **Mobile Friendly**: Responsive design for all devices
- **Fast**: Optimized for performance with caching

## Navigation

The Job Board feature is accessible through:

- **Job Board Page**: `/job-board`
- **Sidebar Navigation**: Available when JOB_BOARD feature is enabled
- **Feature Guard**: Shows appropriate messaging when feature is disabled

## File Structure

```
src/
├── app/
│   ├── job-board/page.tsx                    # Main job board page
│   └── api/
│       ├── sites/[siteId]/
│       │   ├── companies/                    # Company management
│       │   │   ├── route.ts
│       │   │   └── [companyId]/route.ts
│       │   └── job-listings/                # Job listing management
│       │       ├── route.ts
│       │       └── [jobListingId]/route.ts
│       └── public/sites/[siteId]/job-board/route.ts  # Public API
├── components/
│   ├── JobBoardManager.tsx                   # Main job board component
│   ├── CompanyManager.tsx                    # Company management
│   └── JobListingManager.tsx                 # Job listing management
├── scripts/
│   └── add-job-board-feature.ts             # Setup script
└── prisma/
    └── schema.prisma                         # Updated with new models
```

## Next Steps

Potential enhancements:

1. **Email Notifications**: Send emails when jobs are posted or applied to
2. **Application Tracking**: Track job applications and candidate management
3. **Advanced Search**: Full-text search with relevance scoring
4. **Job Alerts**: Email notifications for new jobs matching criteria
5. **Analytics**: Job view analytics and application tracking
6. **Integration**: Webhook support for third-party job boards
7. **Templates**: Pre-built job description templates
8. **Bulk Operations**: Import/export companies and job listings
9. **Advanced Filtering**: More granular filtering options
10. **Job Recommendations**: AI-powered job recommendations for candidates
