import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with dummy site data...');

  // Create some dummy sites
  const sites = [
    {
      name: 'Tech Blog',
      domain: 'techblog.example.com',
      pages: [
        {
          title: 'Home',
          slug: 'home',
          content: '<h1>Welcome to Tech Blog</h1><p>Your source for the latest in technology news and insights.</p>',
          isPublished: true,
        },
        {
          title: 'About Us',
          slug: 'about',
          content: '<h1>About Tech Blog</h1><p>We are passionate about technology and sharing knowledge with our readers.</p>',
          isPublished: true,
        },
        {
          title: 'Contact',
          slug: 'contact',
          content: '<h1>Contact Us</h1><p>Get in touch with our team for any inquiries.</p>',
          isPublished: false,
        },
      ],
      blogPosts: [
        {
          title: 'Getting Started with Next.js',
          slug: 'getting-started-with-nextjs',
          content: '<h1>Getting Started with Next.js</h1><p>Next.js is a powerful React framework that makes building full-stack web applications simple and efficient.</p>',
          excerpt: 'Learn how to get started with Next.js and build your first application.',
          isPublished: true,
          publishedAt: new Date('2024-01-15'),
        },
        {
          title: 'The Future of Web Development',
          slug: 'future-of-web-development',
          content: '<h1>The Future of Web Development</h1><p>Web development is constantly evolving with new technologies and frameworks emerging every day.</p>',
          excerpt: 'Explore the latest trends and technologies shaping the future of web development.',
          isPublished: true,
          publishedAt: new Date('2024-01-20'),
        },
        {
          title: 'Draft: Advanced TypeScript Patterns',
          slug: 'advanced-typescript-patterns',
          content: '<h1>Advanced TypeScript Patterns</h1><p>Discover advanced TypeScript patterns that can improve your code quality and developer experience.</p>',
          excerpt: 'Learn advanced TypeScript patterns for better code organization.',
          isPublished: false,
        },
      ],
      mediaFiles: [
        {
          filename: 'hero-image.jpg',
          originalName: 'hero-image.jpg',
          mimeType: 'image/jpeg',
          size: 1024000,
          url: '/uploads/hero-image.jpg',
        },
        {
          filename: 'logo.png',
          originalName: 'logo.png',
          mimeType: 'image/png',
          size: 512000,
          url: '/uploads/logo.png',
        },
      ],
    },
    {
      name: 'E-commerce Store',
      domain: 'shop.example.com',
      pages: [
        {
          title: 'Home',
          slug: 'home',
          content: '<h1>Welcome to Our Store</h1><p>Discover amazing products at great prices.</p>',
          isPublished: true,
        },
        {
          title: 'Products',
          slug: 'products',
          content: '<h1>Our Products</h1><p>Browse our extensive collection of high-quality products.</p>',
          isPublished: true,
        },
        {
          title: 'Shipping Policy',
          slug: 'shipping',
          content: '<h1>Shipping Policy</h1><p>Learn about our shipping options and delivery times.</p>',
          isPublished: true,
        },
      ],
      blogPosts: [
        {
          title: 'New Product Launch',
          slug: 'new-product-launch',
          content: '<h1>New Product Launch</h1><p>We are excited to announce our latest product line.</p>',
          excerpt: 'Discover our newest products and what makes them special.',
          isPublished: true,
          publishedAt: new Date('2024-01-10'),
        },
      ],
      mediaFiles: [
        {
          filename: 'product-catalog.pdf',
          originalName: 'product-catalog.pdf',
          mimeType: 'application/pdf',
          size: 2048000,
          url: '/uploads/product-catalog.pdf',
        },
      ],
    },
    {
      name: 'Portfolio Site',
      domain: 'portfolio.example.com',
      pages: [
        {
          title: 'Home',
          slug: 'home',
          content: '<h1>Welcome to My Portfolio</h1><p>I am a passionate developer creating amazing digital experiences.</p>',
          isPublished: true,
        },
        {
          title: 'Projects',
          slug: 'projects',
          content: '<h1>My Projects</h1><p>Here are some of the projects I have worked on.</p>',
          isPublished: true,
        },
        {
          title: 'Resume',
          slug: 'resume',
          content: '<h1>Resume</h1><p>Download my resume to learn more about my experience and skills.</p>',
          isPublished: true,
        },
      ],
      blogPosts: [
        {
          title: 'My Journey in Web Development',
          slug: 'web-development-journey',
          content: '<h1>My Journey in Web Development</h1><p>Reflecting on my path from beginner to experienced developer.</p>',
          excerpt: 'A personal reflection on my journey in web development.',
          isPublished: true,
          publishedAt: new Date('2024-01-05'),
        },
      ],
      mediaFiles: [
        {
          filename: 'profile-photo.jpg',
          originalName: 'profile-photo.jpg',
          mimeType: 'image/jpeg',
          size: 768000,
          url: '/uploads/profile-photo.jpg',
        },
        {
          filename: 'resume.pdf',
          originalName: 'resume.pdf',
          mimeType: 'application/pdf',
          size: 1536000,
          url: '/uploads/resume.pdf',
        },
      ],
    },
  ];

  for (const siteData of sites) {
    console.log(`Creating site: ${siteData.name}`);
    
    const site = await prisma.site.create({
      data: {
        name: siteData.name,
        domain: siteData.domain,
        pages: {
          create: siteData.pages,
        },
        blogPosts: {
          create: siteData.blogPosts,
        },
        mediaFiles: {
          create: siteData.mediaFiles,
        },
      },
    });

    console.log(`✅ Created site: ${site.name} (ID: ${site.id})`);
  }

  // Get existing users to assign to sites
  const users = await prisma.user.findMany();
  
  if (users.length > 0) {
    const sites = await prisma.site.findMany();
    
    // Assign users to sites based on their role
    for (let i = 0; i < Math.min(users.length, sites.length); i++) {
      const user = users[i];
      const site = sites[i];
      
      await prisma.site.update({
        where: { id: site.id },
        data: {
          users: {
            connect: { id: user.id },
          },
        },
      });
      
      console.log(`✅ Connected user ${user.email} to site ${site.name}`);
    }
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 