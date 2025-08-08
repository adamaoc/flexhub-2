#!/usr/bin/env tsx

import {
  PrismaClient,
  JobType,
  ExperienceLevel,
  RemoteWorkType,
} from "@prisma/client";

const prisma = new PrismaClient();

const SITE_ID = "022f4d6a-7c7b-4e07-af19-6bb99f5634fa";

const companies = [
  {
    name: "TechFlow Solutions",
    description:
      "A leading software development company specializing in web applications, mobile apps, and cloud solutions. We help businesses transform their digital presence with cutting-edge technology.",
    website: "https://techflow-solutions.com",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
    location: "San Francisco, CA",
    industry: "Technology",
    size: "50-200 employees",
    founded: 2018,
  },
  {
    name: "GreenEarth Innovations",
    description:
      "Pioneering sustainable technology solutions for a greener future. We develop renewable energy systems, smart city infrastructure, and environmental monitoring platforms.",
    website: "https://greenearth-innovations.com",
    logo: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=150&h=150&fit=crop&crop=center",
    location: "Austin, TX",
    industry: "Clean Technology",
    size: "25-100 employees",
    founded: 2020,
  },
  {
    name: "DataSphere Analytics",
    description:
      "Advanced analytics and machine learning company helping organizations make data-driven decisions. We specialize in big data processing, predictive analytics, and business intelligence.",
    website: "https://datasphere-analytics.com",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&h=150&fit=crop&crop=center",
    location: "Seattle, WA",
    industry: "Data Science",
    size: "100-500 employees",
    founded: 2016,
  },
  {
    name: "CreativeMinds Studio",
    description:
      "Full-service digital agency creating stunning websites, mobile apps, and digital experiences. We combine creativity with technical excellence to deliver exceptional results.",
    website: "https://creativeminds-studio.com",
    logo: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=150&h=150&fit=crop&crop=center",
    location: "New York, NY",
    industry: "Digital Marketing",
    size: "10-50 employees",
    founded: 2019,
  },
];

const jobListings = [
  // TechFlow Solutions Jobs
  {
    title: "Senior Full Stack Developer",
    description:
      "<p>We're looking for an experienced Full Stack Developer to join our growing team. You'll be responsible for developing and maintaining web applications using modern technologies.</p><p><strong>What you'll do:</strong></p><ul><li>Develop and maintain web applications using React, Node.js, and TypeScript</li><li>Collaborate with cross-functional teams to deliver high-quality software</li><li>Write clean, maintainable, and well-documented code</li><li>Participate in code reviews and technical discussions</li><li>Mentor junior developers and share best practices</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>5+ years of experience in full-stack development</li><li>Strong proficiency in JavaScript/TypeScript, React, and Node.js</li><li>Experience with cloud platforms (AWS, Azure, or GCP)</li><li>Knowledge of database design and SQL</li><li>Experience with Git and agile development methodologies</li><li>Excellent problem-solving and communication skills</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity options</li><li>Flexible work arrangements and remote work options</li><li>Comprehensive health, dental, and vision insurance</li><li>401(k) matching and professional development budget</li><li>Unlimited PTO and paid parental leave</li><li>Modern office with free snacks and beverages</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "SENIOR",
    remoteWorkType: "HYBRID",
    salaryMin: 120000,
    salaryMax: 180000,
    location: "San Francisco, CA",
    applicationUrl:
      "https://techflow-solutions.com/careers/senior-full-stack-developer",
    companyIndex: 0,
  },
  {
    title: "Frontend Developer",
    description:
      "<p>Join our frontend team and help create beautiful, responsive user interfaces. You'll work with modern frameworks and tools to build exceptional user experiences.</p><p><strong>What you'll do:</strong></p><ul><li>Build responsive and accessible user interfaces using React</li><li>Optimize applications for maximum speed and scalability</li><li>Collaborate with designers to implement pixel-perfect designs</li><li>Write unit tests and ensure code quality</li><li>Stay up-to-date with frontend best practices and trends</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in frontend development</li><li>Strong knowledge of HTML, CSS, and JavaScript</li><li>Experience with React and modern build tools</li><li>Understanding of responsive design principles</li><li>Familiarity with version control systems</li><li>Portfolio of previous work or open source contributions</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits package</li><li>Remote work flexibility</li><li>Health and wellness benefits</li><li>Professional development opportunities</li><li>Fun team events and activities</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 80000,
    salaryMax: 120000,
    location: "San Francisco, CA",
    applicationUrl: "https://techflow-solutions.com/careers/frontend-developer",
    companyIndex: 0,
  },
  {
    title: "DevOps Engineer",
    description:
      "<p>We're seeking a DevOps Engineer to help us build and maintain our cloud infrastructure. You'll work on automation, monitoring, and deployment processes.</p><p><strong>What you'll do:</strong></p><ul><li>Design and implement CI/CD pipelines</li><li>Manage cloud infrastructure on AWS</li><li>Monitor system performance and reliability</li><li>Automate deployment and scaling processes</li><li>Collaborate with development teams on infrastructure needs</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>4+ years of experience in DevOps or infrastructure engineering</li><li>Strong knowledge of AWS services and best practices</li><li>Experience with Docker, Kubernetes, and Terraform</li><li>Proficiency in scripting languages (Python, Bash)</li><li>Experience with monitoring tools (Prometheus, Grafana)</li><li>Understanding of security best practices</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Comprehensive benefits package</li><li>Professional development and certifications</li><li>Flexible work arrangements</li><li>Modern tools and equipment</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 100000,
    salaryMax: 150000,
    location: "San Francisco, CA",
    applicationUrl: "https://techflow-solutions.com/careers/devops-engineer",
    companyIndex: 0,
  },
  {
    title: "Product Manager",
    description:
      "<p>Join our product team and help shape the future of our software solutions. You'll work closely with customers, designers, and engineers to deliver exceptional products.</p><p><strong>What you'll do:</strong></p><ul><li>Define product strategy and roadmap</li><li>Gather and analyze customer requirements</li><li>Work with cross-functional teams to deliver features</li><li>Conduct market research and competitive analysis</li><li>Track product metrics and success indicators</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>5+ years of experience in product management</li><li>Experience in B2B SaaS or enterprise software</li><li>Strong analytical and problem-solving skills</li><li>Excellent communication and stakeholder management</li><li>Technical background or understanding preferred</li><li>Experience with agile development methodologies</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Comprehensive health benefits</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Regular team events and activities</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "SENIOR",
    remoteWorkType: "HYBRID",
    salaryMin: 130000,
    salaryMax: 190000,
    location: "San Francisco, CA",
    applicationUrl: "https://techflow-solutions.com/careers/product-manager",
    companyIndex: 0,
  },
  {
    title: "QA Engineer",
    description:
      "<p>Help us ensure the highest quality of our software products. You'll design and execute test plans, automate testing processes, and work with development teams.</p><p><strong>What you'll do:</strong></p><ul><li>Design and execute comprehensive test plans</li><li>Develop and maintain automated test suites</li><li>Perform manual testing for new features</li><li>Collaborate with developers to identify and fix bugs</li><li>Contribute to quality assurance processes and standards</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in software testing</li><li>Experience with test automation frameworks</li><li>Knowledge of web technologies and APIs</li><li>Strong attention to detail and analytical skills</li><li>Experience with agile development processes</li><li>Excellent communication and documentation skills</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Health and wellness benefits</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Collaborative team environment</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 70000,
    salaryMax: 110000,
    location: "San Francisco, CA",
    applicationUrl: "https://techflow-solutions.com/careers/qa-engineer",
    companyIndex: 0,
  },

  // GreenEarth Innovations Jobs
  {
    title: "Renewable Energy Engineer",
    description:
      "<p>Join our mission to create sustainable energy solutions. You'll work on innovative renewable energy projects and help develop cutting-edge green technologies.</p><p><strong>What you'll do:</strong></p><ul><li>Design and optimize renewable energy systems</li><li>Conduct feasibility studies and technical analysis</li><li>Collaborate with cross-functional teams on energy projects</li><li>Stay current with renewable energy technologies and trends</li><li>Contribute to sustainability initiatives and goals</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Bachelor's degree in Engineering or related field</li><li>3+ years of experience in renewable energy</li><li>Knowledge of solar, wind, or energy storage systems</li><li>Experience with energy modeling and analysis tools</li><li>Strong problem-solving and analytical skills</li><li>Passion for sustainability and environmental impact</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Opportunity to make environmental impact</li><li>Professional development and certifications</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 85000,
    salaryMax: 130000,
    location: "Austin, TX",
    applicationUrl:
      "https://greenearth-innovations.com/careers/renewable-energy-engineer",
    companyIndex: 1,
  },
  {
    title: "Sustainability Analyst",
    description:
      "<p>Help organizations measure and improve their environmental impact. You'll analyze sustainability data and develop strategies for reducing carbon footprints.</p><p><strong>What you'll do:</strong></p><ul><li>Conduct environmental impact assessments</li><li>Analyze sustainability metrics and KPIs</li><li>Develop sustainability strategies and recommendations</li><li>Prepare reports and presentations for stakeholders</li><li>Stay current with sustainability standards and regulations</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Bachelor's degree in Environmental Science or related field</li><li>2+ years of experience in sustainability analysis</li><li>Knowledge of environmental regulations and standards</li><li>Experience with data analysis and reporting tools</li><li>Strong analytical and communication skills</li><li>Passion for environmental sustainability</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Meaningful work with environmental impact</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "JUNIOR",
    remoteWorkType: "REMOTE",
    salaryMin: 60000,
    salaryMax: 90000,
    location: "Austin, TX",
    applicationUrl:
      "https://greenearth-innovations.com/careers/sustainability-analyst",
    companyIndex: 1,
  },
  {
    title: "Smart City Solutions Architect",
    description:
      "<p>Design and implement smart city infrastructure solutions. You'll work on projects that improve urban living through technology and sustainability.</p><p><strong>What you'll do:</strong></p><ul><li>Design smart city infrastructure solutions</li><li>Collaborate with government and municipal partners</li><li>Develop IoT and sensor integration strategies</li><li>Create technical specifications and implementation plans</li><li>Lead cross-functional teams on smart city projects</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>5+ years of experience in smart city or IoT projects</li><li>Knowledge of urban planning and infrastructure</li><li>Experience with IoT platforms and sensor technologies</li><li>Strong technical and project management skills</li><li>Experience working with government or municipal clients</li><li>Bachelor's degree in Engineering or related field</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Opportunity to shape future cities</li><li>Comprehensive benefits package</li><li>Professional development opportunities</li><li>Flexible work arrangements</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "SENIOR",
    remoteWorkType: "HYBRID",
    salaryMin: 120000,
    salaryMax: 180000,
    location: "Austin, TX",
    applicationUrl:
      "https://greenearth-innovations.com/careers/smart-city-architect",
    companyIndex: 1,
  },
  {
    title: "Environmental Data Scientist",
    description:
      "<p>Use data science to solve environmental challenges. You'll analyze environmental data and develop predictive models for climate and sustainability applications.</p><p><strong>What you'll do:</strong></p><ul><li>Develop machine learning models for environmental prediction</li><li>Analyze climate and environmental datasets</li><li>Create data visualization and reporting tools</li><li>Collaborate with environmental scientists and engineers</li><li>Contribute to research and development initiatives</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Master's degree in Data Science, Environmental Science, or related field</li><li>3+ years of experience in environmental data analysis</li><li>Proficiency in Python, R, or similar programming languages</li><li>Experience with machine learning and statistical modeling</li><li>Knowledge of environmental science and climate data</li><li>Strong analytical and problem-solving skills</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Opportunity to work on climate solutions</li><li>Professional development and research opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 90000,
    salaryMax: 140000,
    location: "Austin, TX",
    applicationUrl:
      "https://greenearth-innovations.com/careers/environmental-data-scientist",
    companyIndex: 1,
  },
  {
    title: "Green Technology Intern",
    description:
      "<p>Gain hands-on experience in renewable energy and sustainability. You'll work on real projects and learn from experienced professionals in the green technology sector.</p><p><strong>What you'll do:</strong></p><ul><li>Support renewable energy project development</li><li>Conduct research on green technologies</li><li>Assist with environmental impact assessments</li><li>Learn about sustainability best practices</li><li>Contribute to team projects and initiatives</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Currently pursuing degree in Engineering, Environmental Science, or related field</li><li>Strong academic record and GPA</li><li>Interest in renewable energy and sustainability</li><li>Basic knowledge of environmental concepts</li><li>Strong communication and teamwork skills</li><li>Available for 3-6 month internship</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive internship stipend</li><li>Hands-on experience in green technology</li><li>Mentorship from experienced professionals</li><li>Networking opportunities</li><li>Potential for full-time employment</li></ul>",
    jobType: "INTERNSHIP",
    experienceLevel: "ENTRY_LEVEL",
    remoteWorkType: "ON_SITE",
    salaryMin: 25000,
    salaryMax: 35000,
    location: "Austin, TX",
    applicationUrl:
      "https://greenearth-innovations.com/careers/green-technology-intern",
    companyIndex: 1,
  },

  // DataSphere Analytics Jobs
  {
    title: "Senior Data Scientist",
    description:
      "<p>Lead our data science initiatives and develop advanced machine learning models. You'll work on complex problems and help drive data-driven decision making.</p><p><strong>What you'll do:</strong></p><ul><li>Develop and deploy machine learning models</li><li>Lead data science projects and initiatives</li><li>Mentor junior data scientists</li><li>Collaborate with engineering and product teams</li><li>Present findings to stakeholders and clients</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>5+ years of experience in data science or machine learning</li><li>Strong proficiency in Python, R, or similar languages</li><li>Experience with deep learning frameworks (TensorFlow, PyTorch)</li><li>Knowledge of statistical modeling and experimental design</li><li>Experience with big data technologies (Spark, Hadoop)</li><li>PhD in Computer Science, Statistics, or related field preferred</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Comprehensive benefits package</li><li>Professional development and conference attendance</li><li>Flexible work arrangements</li><li>Modern office with latest technology</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "SENIOR",
    remoteWorkType: "HYBRID",
    salaryMin: 140000,
    salaryMax: 200000,
    location: "Seattle, WA",
    applicationUrl:
      "https://datasphere-analytics.com/careers/senior-data-scientist",
    companyIndex: 2,
  },
  {
    title: "Machine Learning Engineer",
    description:
      "<p>Build scalable machine learning systems and infrastructure. You'll work on deploying models to production and optimizing ML pipelines.</p><p><strong>What you'll do:</strong></p><ul><li>Design and implement ML infrastructure and pipelines</li><li>Deploy machine learning models to production</li><li>Optimize model performance and scalability</li><li>Collaborate with data scientists and engineers</li><li>Maintain and monitor ML systems</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in machine learning engineering</li><li>Strong programming skills in Python, Java, or Scala</li><li>Experience with ML frameworks and cloud platforms</li><li>Knowledge of software engineering best practices</li><li>Experience with containerization and microservices</li><li>Understanding of ML model deployment and monitoring</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Comprehensive benefits package</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Modern tools and infrastructure</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 110000,
    salaryMax: 160000,
    location: "Seattle, WA",
    applicationUrl: "https://datasphere-analytics.com/careers/ml-engineer",
    companyIndex: 2,
  },
  {
    title: "Business Intelligence Analyst",
    description:
      "<p>Transform data into actionable insights for business decisions. You'll create reports, dashboards, and analytics solutions for our clients.</p><p><strong>What you'll do:</strong></p><ul><li>Develop BI dashboards and reports</li><li>Analyze business metrics and KPIs</li><li>Create data visualizations and presentations</li><li>Collaborate with business stakeholders</li><li>Identify trends and opportunities in data</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in business intelligence or analytics</li><li>Proficiency in SQL and data visualization tools</li><li>Experience with BI platforms (Tableau, Power BI, Looker)</li><li>Strong analytical and problem-solving skills</li><li>Experience with data warehousing concepts</li><li>Excellent communication and presentation skills</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Health and wellness benefits</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Collaborative team environment</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 80000,
    salaryMax: 120000,
    location: "Seattle, WA",
    applicationUrl: "https://datasphere-analytics.com/careers/bi-analyst",
    companyIndex: 2,
  },
  {
    title: "Data Engineer",
    description:
      "<p>Build and maintain data pipelines and infrastructure. You'll work on collecting, processing, and storing large-scale data for analytics and ML applications.</p><p><strong>What you'll do:</strong></p><ul><li>Design and implement data pipelines</li><li>Build and maintain data warehouses</li><li>Optimize data processing and storage</li><li>Ensure data quality and reliability</li><li>Collaborate with data scientists and analysts</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>4+ years of experience in data engineering</li><li>Strong programming skills in Python, Java, or Scala</li><li>Experience with big data technologies (Spark, Hadoop)</li><li>Knowledge of SQL and database design</li><li>Experience with cloud data platforms (AWS, GCP, Azure)</li><li>Understanding of data modeling and ETL processes</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and equity</li><li>Comprehensive benefits package</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Modern data infrastructure</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 100000,
    salaryMax: 150000,
    location: "Seattle, WA",
    applicationUrl: "https://datasphere-analytics.com/careers/data-engineer",
    companyIndex: 2,
  },
  {
    title: "Quantitative Analyst",
    description:
      "<p>Apply advanced statistical and mathematical methods to solve complex business problems. You'll work on predictive modeling and risk analysis.</p><p><strong>What you'll do:</strong></p><ul><li>Develop statistical models and algorithms</li><li>Conduct risk analysis and assessment</li><li>Create predictive models for business applications</li><li>Analyze large datasets for patterns and insights</li><li>Present findings to technical and non-technical audiences</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Master's degree in Statistics, Mathematics, or related field</li><li>3+ years of experience in quantitative analysis</li><li>Strong programming skills in Python, R, or MATLAB</li><li>Knowledge of statistical modeling and machine learning</li><li>Experience with financial or business analytics preferred</li><li>Strong mathematical and analytical skills</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Professional development opportunities</li><li>Health and wellness benefits</li><li>Flexible work arrangements</li><li>Collaborative research environment</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 90000,
    salaryMax: 140000,
    location: "Seattle, WA",
    applicationUrl:
      "https://datasphere-analytics.com/careers/quantitative-analyst",
    companyIndex: 2,
  },
  {
    title: "Data Science Intern",
    description:
      "<p>Gain hands-on experience in data science and machine learning. You'll work on real projects and learn from experienced data scientists.</p><p><strong>What you'll do:</strong></p><ul><li>Assist with data analysis and modeling projects</li><li>Learn machine learning algorithms and techniques</li><li>Work with real datasets and business problems</li><li>Contribute to team projects and research</li><li>Present findings and insights to the team</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Currently pursuing degree in Computer Science, Statistics, or related field</li><li>Strong academic record and GPA</li><li>Basic knowledge of Python and data analysis</li><li>Interest in machine learning and statistics</li><li>Strong analytical and problem-solving skills</li><li>Available for 3-6 month internship</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive internship stipend</li><li>Hands-on experience with real projects</li><li>Mentorship from experienced data scientists</li><li>Networking opportunities</li><li>Potential for full-time employment</li></ul>",
    jobType: "INTERNSHIP",
    experienceLevel: "ENTRY_LEVEL",
    remoteWorkType: "ON_SITE",
    salaryMin: 30000,
    salaryMax: 45000,
    location: "Seattle, WA",
    applicationUrl:
      "https://datasphere-analytics.com/careers/data-science-intern",
    companyIndex: 2,
  },

  // CreativeMinds Studio Jobs
  {
    title: "Senior UX/UI Designer",
    description:
      "<p>Create exceptional user experiences and beautiful interfaces. You'll lead design projects and help shape the visual direction of our products.</p><p><strong>What you'll do:</strong></p><ul><li>Design user interfaces and user experiences</li><li>Conduct user research and usability testing</li><li>Create wireframes, prototypes, and design systems</li><li>Collaborate with developers and product managers</li><li>Lead design projects and mentor junior designers</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>5+ years of experience in UX/UI design</li><li>Strong portfolio showcasing web and mobile design work</li><li>Proficiency in design tools (Figma, Sketch, Adobe Creative Suite)</li><li>Experience with user research and usability testing</li><li>Knowledge of design systems and component libraries</li><li>Understanding of web technologies and design constraints</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Creative and collaborative work environment</li><li>Professional development and design tools</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "SENIOR",
    remoteWorkType: "HYBRID",
    salaryMin: 100000,
    salaryMax: 150000,
    location: "New York, NY",
    applicationUrl:
      "https://creativeminds-studio.com/careers/senior-ux-ui-designer",
    companyIndex: 3,
  },
  {
    title: "Digital Marketing Specialist",
    description:
      "<p>Develop and execute digital marketing campaigns. You'll help clients grow their online presence and achieve their marketing goals.</p><p><strong>What you'll do:</strong></p><ul><li>Develop and execute digital marketing strategies</li><li>Manage social media campaigns and content</li><li>Optimize websites for search engines (SEO)</li><li>Create and manage paid advertising campaigns</li><li>Analyze marketing performance and provide insights</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in digital marketing</li><li>Experience with social media platforms and advertising</li><li>Knowledge of SEO and content marketing</li><li>Experience with Google Analytics and marketing tools</li><li>Strong analytical and communication skills</li><li>Creative thinking and problem-solving abilities</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Creative and dynamic work environment</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 60000,
    salaryMax: 90000,
    location: "New York, NY",
    applicationUrl:
      "https://creativeminds-studio.com/careers/digital-marketing-specialist",
    companyIndex: 3,
  },
  {
    title: "Frontend Developer",
    description:
      "<p>Build beautiful and responsive websites and web applications. You'll work with modern technologies to create exceptional user experiences.</p><p><strong>What you'll do:</strong></p><ul><li>Develop responsive websites and web applications</li><li>Collaborate with designers to implement pixel-perfect designs</li><li>Optimize websites for performance and accessibility</li><li>Write clean, maintainable, and well-documented code</li><li>Stay current with frontend technologies and best practices</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in frontend development</li><li>Strong knowledge of HTML, CSS, and JavaScript</li><li>Experience with React, Vue, or similar frameworks</li><li>Understanding of responsive design principles</li><li>Experience with version control systems</li><li>Portfolio of previous work or open source contributions</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Creative and collaborative work environment</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 70000,
    salaryMax: 110000,
    location: "New York, NY",
    applicationUrl:
      "https://creativeminds-studio.com/careers/frontend-developer",
    companyIndex: 3,
  },
  {
    title: "Content Strategist",
    description:
      "<p>Develop content strategies and create compelling content for our clients. You'll help brands tell their stories and connect with their audiences.</p><p><strong>What you'll do:</strong></p><ul><li>Develop content strategies for clients</li><li>Create compelling copy for websites, social media, and marketing materials</li><li>Conduct content audits and competitive analysis</li><li>Collaborate with designers and marketers</li><li>Optimize content for search engines and user engagement</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>3+ years of experience in content strategy or copywriting</li><li>Strong writing and editing skills</li><li>Experience with content marketing and SEO</li><li>Knowledge of different content formats and platforms</li><li>Strong research and analytical skills</li><li>Portfolio of previous work</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Creative and collaborative work environment</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "REMOTE",
    salaryMin: 55000,
    salaryMax: 85000,
    location: "New York, NY",
    applicationUrl:
      "https://creativeminds-studio.com/careers/content-strategist",
    companyIndex: 3,
  },
  {
    title: "Project Manager",
    description:
      "<p>Lead digital projects from conception to completion. You'll coordinate teams, manage timelines, and ensure successful project delivery.</p><p><strong>What you'll do:</strong></p><ul><li>Lead digital projects and coordinate team efforts</li><li>Manage project timelines, budgets, and resources</li><li>Communicate with clients and stakeholders</li><li>Ensure quality standards and project deliverables</li><li>Identify and mitigate project risks</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>4+ years of experience in project management</li><li>Experience managing digital or creative projects</li><li>Strong organizational and communication skills</li><li>Knowledge of project management methodologies</li><li>Experience with project management tools</li><li>Ability to work with cross-functional teams</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive salary and benefits</li><li>Dynamic and collaborative work environment</li><li>Professional development opportunities</li><li>Flexible work arrangements</li><li>Health and wellness benefits</li></ul>",
    jobType: "FULL_TIME",
    experienceLevel: "MID_LEVEL",
    remoteWorkType: "HYBRID",
    salaryMin: 75000,
    salaryMax: 110000,
    location: "New York, NY",
    applicationUrl: "https://creativeminds-studio.com/careers/project-manager",
    companyIndex: 3,
  },
  {
    title: "Creative Design Intern",
    description:
      "<p>Gain hands-on experience in digital design and creative work. You'll work on real projects and learn from experienced designers.</p><p><strong>What you'll do:</strong></p><ul><li>Assist with design projects and creative work</li><li>Learn design tools and techniques</li><li>Contribute to team projects and initiatives</li><li>Create mockups and design concepts</li><li>Learn about digital design best practices</li></ul>",
    requirements:
      "<p><strong>Requirements:</strong></p><ul><li>Currently pursuing degree in Design, Fine Arts, or related field</li><li>Basic knowledge of design tools (Photoshop, Illustrator, Figma)</li><li>Strong creative and artistic abilities</li><li>Interest in digital design and user experience</li><li>Strong communication and teamwork skills</li><li>Available for 3-6 month internship</li></ul>",
    benefits:
      "<p><strong>Benefits:</strong></p><ul><li>Competitive internship stipend</li><li>Hands-on experience with real projects</li><li>Mentorship from experienced designers</li><li>Networking opportunities</li><li>Potential for full-time employment</li></ul>",
    jobType: "INTERNSHIP",
    experienceLevel: "ENTRY_LEVEL",
    remoteWorkType: "ON_SITE",
    salaryMin: 20000,
    salaryMax: 30000,
    location: "New York, NY",
    applicationUrl:
      "https://creativeminds-studio.com/careers/creative-design-intern",
    companyIndex: 3,
  },
];

async function seedJobBoardData() {
  try {
    console.log("🌱 Seeding job board data...");

    // Check if site exists
    const site = await prisma.site.findUnique({
      where: { id: SITE_ID },
      include: {
        features: {
          where: {
            feature: "JOB_BOARD",
            isEnabled: true,
          },
        },
      },
    });

    if (!site) {
      console.log("❌ Site not found or job board feature not enabled");
      return;
    }

    console.log(`✅ Found site: ${site.name}`);

    // Create companies
    console.log("\n🏢 Creating companies...");
    const createdCompanies = [];

    for (const companyData of companies) {
      const company = await prisma.company.create({
        data: {
          ...companyData,
          siteId: SITE_ID,
        },
      });
      createdCompanies.push(company);
      console.log(`✅ Created company: ${company.name}`);
    }

    // Create job listings
    console.log("\n💼 Creating job listings...");
    let jobCount = 0;

    for (const jobData of jobListings) {
      const company = createdCompanies[jobData.companyIndex];

      const job = await prisma.jobListing.create({
        data: {
          title: jobData.title,
          description: jobData.description,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          jobType: jobData.jobType as JobType,
          experienceLevel: jobData.experienceLevel as ExperienceLevel,
          remoteWorkType: jobData.remoteWorkType as RemoteWorkType,
          salaryMin: jobData.salaryMin,
          salaryMax: jobData.salaryMax,
          salaryCurrency: "USD",
          location: jobData.location,
          applicationUrl: jobData.applicationUrl,
          companyId: company.id,
          siteId: SITE_ID,
          status: "ACTIVE",
        },
      });

      jobCount++;
      console.log(`✅ Created job: ${job.title} at ${company.name}`);
    }

    console.log("\n🎉 Job board seeding completed!");
    console.log(`📊 Summary:`);
    console.log(`   - Companies created: ${createdCompanies.length}`);
    console.log(`   - Job listings created: ${jobCount}`);
    console.log(`   - Site: ${site.name} (${SITE_ID})`);

    console.log("\n🔗 Next steps:");
    console.log("1. Visit the Job Board page in your admin panel");
    console.log("2. Test the public API endpoints");
    console.log("3. Try filtering and searching the job listings");
  } catch (error) {
    console.error("❌ Error seeding job board data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJobBoardData();
