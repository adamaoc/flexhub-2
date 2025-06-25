import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupContactManagement() {
  try {
    console.log('Setting up contact management for sites...');

    // Find all sites that have CONTACT_MANAGEMENT feature enabled
    const sitesWithContactFeature = await prisma.site.findMany({
      where: {
        features: {
          some: {
            feature: 'CONTACT_MANAGEMENT',
            isEnabled: true
          }
        }
      },
      include: {
        contactForm: true
      }
    });

    console.log(`Found ${sitesWithContactFeature.length} sites with contact management enabled`);

    for (const site of sitesWithContactFeature) {
      // Skip if contact form already exists
      if (site.contactForm) {
        console.log(`Site ${site.name} already has a contact form, skipping...`);
        continue;
      }

      console.log(`Creating default contact form for site: ${site.name}`);

      // Create the contact form
      const contactForm = await prisma.contactForm.create({
        data: {
          name: 'Contact Form',
          description: 'Default contact form for your website',
          isActive: true,
          siteId: site.id
        }
      });

      // Create default fields
      const defaultFields = [
        {
          fieldName: 'firstName',
          fieldLabel: 'First Name',
          fieldType: 'TEXT' as const,
          isRequired: true,
          placeholder: 'Enter your first name',
          sortOrder: 1
        },
        {
          fieldName: 'lastName',
          fieldLabel: 'Last Name',
          fieldType: 'TEXT' as const,
          isRequired: true,
          placeholder: 'Enter your last name',
          sortOrder: 2
        },
        {
          fieldName: 'email',
          fieldLabel: 'Email Address',
          fieldType: 'EMAIL' as const,
          isRequired: false,
          placeholder: 'Enter your email address',
          sortOrder: 3
        },
        {
          fieldName: 'companyName',
          fieldLabel: 'Company Name',
          fieldType: 'TEXT' as const,
          isRequired: false,
          placeholder: 'Enter your company name',
          sortOrder: 4
        },
        {
          fieldName: 'phoneNumber',
          fieldLabel: 'Phone Number',
          fieldType: 'PHONE' as const,
          isRequired: false,
          placeholder: 'Enter your phone number',
          sortOrder: 5
        },
        {
          fieldName: 'reasonForContact',
          fieldLabel: 'Reason for Contact',
          fieldType: 'SELECT' as const,
          isRequired: true,
          options: JSON.stringify([
            'General Inquiry',
            'Support Request',
            'Business Partnership',
            'Feedback',
            'Other'
          ]),
          sortOrder: 6
        },
        {
          fieldName: 'message',
          fieldLabel: 'Message',
          fieldType: 'TEXTAREA' as const,
          isRequired: true,
          placeholder: 'Enter your message',
          helpText: 'Please provide details about your inquiry',
          sortOrder: 7
        }
      ];

      await prisma.contactFormField.createMany({
        data: defaultFields.map(field => ({
          ...field,
          contactFormId: contactForm.id
        }))
      });

      console.log(`✅ Created contact form with ${defaultFields.length} fields for site: ${site.name}`);
    }

    console.log('✅ Contact management setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up contact management:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  setupContactManagement()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default setupContactManagement; 