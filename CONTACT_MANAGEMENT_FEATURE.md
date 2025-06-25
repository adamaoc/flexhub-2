# Contact Management Feature Implementation

## Overview

The Contact Management feature allows FlexHub sites to create custom contact forms and manage form submissions. This feature provides a complete solution for collecting and managing customer inquiries from external websites.

## Database Schema

### New Models Added

1. **ContactForm** - Stores contact form configuration for each site
   - Each site can have one contact form
   - Contains form metadata (name, description, active status)

2. **ContactFormField** - Defines individual fields in contact forms
   - Supports various field types (TEXT, EMAIL, PHONE, TEXTAREA, SELECT, etc.)
   - Configurable validation (required/optional)
   - Customizable labels, placeholders, and help text

3. **ContactSubmission** - Stores form submissions
   - Tracks submission metadata (IP, user agent, timestamps)
   - Status tracking (read/unread, archived)

4. **ContactSubmissionData** - Stores individual field data for each submission
   - Links field definitions with submitted values
   - Maintains data relationships for flexible querying

## API Endpoints

### Admin Endpoints (Protected)

- `GET/PUT/POST /api/sites/[siteId]/contact-form` - Manage contact form configuration
- `GET /api/sites/[siteId]/contact-submissions` - List submissions with pagination and filtering
- `GET/PUT/DELETE /api/sites/[siteId]/contact-submissions/[submissionId]` - Manage individual submissions

### Public Endpoints

- `POST /api/public/sites/[siteId]/contact` - Submit contact form (public endpoint with CORS)

## Admin Interface

### Contact Form Manager (`/contact`)
- **Form Settings Tab**: Configure basic form properties
- **Form Builder**: Add/edit/remove form fields with drag-and-drop interface
- **Field Types**: Support for text, email, phone, textarea, select, checkbox, radio, number, URL
- **Validation**: Mark fields as required/optional
- **Preview**: Real-time form preview
- **API Integration**: Copy-paste API endpoint and example code

### Contact Submissions Manager
- **Submissions List**: Paginated view of all form submissions
- **Filtering**: Filter by read status, archive status, search
- **Status Management**: Mark as read, archive/unarchive submissions
- **Detailed View**: View full submission details in modal
- **Actions**: Delete submissions with confirmation

## Default Contact Form

The system automatically creates a default contact form for sites with CONTACT_MANAGEMENT enabled:

### Default Fields:
1. **First Name** (required) - Text input
2. **Last Name** (required) - Text input  
3. **Email Address** (optional) - Email input
4. **Company Name** (optional) - Text input
5. **Phone Number** (optional) - Phone input
6. **Reason for Contact** (required) - Select dropdown with options:
   - General Inquiry
   - Support Request
   - Business Partnership
   - Feedback
   - Other
7. **Message** (required) - Textarea with help text

## Integration Guide

### For External Websites

1. **Get your Site ID** from the FlexHub admin panel
2. **Copy the API endpoint**: `https://your-flexhub-domain/api/public/sites/[SITE_ID]/contact`
3. **Send POST requests** with form data in this format:

```javascript
{
  "data": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "companyName": "Acme Corp",
    "phoneNumber": "+1234567890",
    "reasonForContact": "General Inquiry",
    "message": "Hello, I'm interested in your services."
  }
}
```

### HTML Example

A complete HTML example is provided at `/public/contact-form-example.html` showing:
- Responsive form styling
- JavaScript form submission with error handling
- Loading states and success/error messages
- Form validation

## Security Features

1. **Authentication**: Admin endpoints require valid session authentication
2. **Authorization**: Users can only access data for sites they have permission to manage
3. **CORS**: Public endpoint supports CORS for cross-origin requests
4. **Input Validation**: Server-side validation of required fields
5. **Rate Limiting**: Built-in protection against spam (inherits from Next.js)
6. **Data Sanitization**: Form data is sanitized and length-limited

## Setup and Migration

### Database Migration
Run the migration to create new tables:
```bash
npx prisma migrate dev --name add_contact_management
```

### Setup Script
Create default contact forms for existing sites:
```bash
npx ts-node scripts/setup-contact-management.ts
```

## Features and Benefits

### For Site Owners:
- **Easy Setup**: Default contact form created automatically
- **Customizable**: Flexible form builder with various field types
- **Professional**: Clean, responsive form interface
- **Organized**: Centralized submission management
- **Trackable**: Read/unread status, archiving system

### For Developers:
- **RESTful API**: Clean, consistent API design
- **Type Safe**: Full TypeScript support
- **Extensible**: Easy to add new field types or features
- **Well Documented**: Complete API documentation and examples

### For End Users:
- **User Friendly**: Intuitive form interface
- **Responsive**: Works on all devices
- **Fast**: Optimized for performance
- **Reliable**: Error handling and validation

## Navigation

The Contact Management feature is accessible through:
- **Contact Page**: `/contact`
- **Sidebar Navigation**: Available when CONTACT_MANAGEMENT feature is enabled
- **Feature Guard**: Shows appropriate messaging when feature is disabled

## File Structure

```
src/
├── app/
│   ├── contact/page.tsx                    # Main contact management page
│   └── api/
│       ├── sites/[siteId]/
│       │   ├── contact-form/route.ts       # Form CRUD
│       │   └── contact-submissions/        # Submission management
│       └── public/sites/[siteId]/contact/route.ts  # Public submission endpoint
├── components/
│   ├── ContactFormManager.tsx              # Form builder component
│   └── ContactSubmissionsManager.tsx       # Submissions management component
├── scripts/
│   └── setup-contact-management.ts         # Setup script
└── prisma/
    └── schema.prisma                       # Updated with new models
```

## Next Steps

Potential enhancements:
1. **Email Notifications**: Send emails when forms are submitted
2. **Export**: Export submissions to CSV/Excel
3. **Templates**: Pre-built form templates
4. **Advanced Fields**: File uploads, date pickers, multi-select
5. **Conditional Logic**: Show/hide fields based on other field values
6. **Integration**: Webhook support for third-party integrations
7. **Analytics**: Form submission analytics and insights 