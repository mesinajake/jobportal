import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Department from '../models/Department.js';

dotenv.config();

// Sample departments for the company
const departments = [
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development, infrastructure, and technical innovation',
    color: '#3B82F6',
    isActive: true
  },
  {
    name: 'IT Support',
    code: 'ITS',
    description: 'Technical support, helpdesk, and IT operations',
    color: '#10B981',
    isActive: true
  },
  {
    name: 'Design',
    code: 'DES',
    description: 'UI/UX design, visual design, and creative services',
    color: '#8B5CF6',
    isActive: true
  },
  {
    name: 'Operations',
    code: 'OPS',
    description: 'Business operations, project management, and process improvement',
    color: '#F59E0B',
    isActive: true
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Talent acquisition, employee relations, and organizational development',
    color: '#EC4899',
    isActive: true
  }
];

// Map job types to departments
const jobDepartmentMap = {
  'developer': 'Engineering',
  'programmer': 'Engineering',
  'software': 'Engineering',
  'web developer': 'Engineering',
  'sharepoint': 'Engineering',
  'tool developer': 'Engineering',
  'support': 'IT Support',
  'tech support': 'IT Support',
  'onsite support': 'IT Support',
  'designer': 'Design',
  'web designer': 'Design',
  'project manager': 'Operations',
  'manager': 'Operations'
};

// Sample jobs converted to new format
const sampleJobs = [
  {
    title: 'Digital Tool Developer',
    description: 'Build and maintain internal tools and automations to support digital operations. You will work with modern technologies to create efficient solutions that streamline our business processes.',
    location: 'Pasay City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 50000, max: 65000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '2+ years experience in software development',
      'Proficiency in Python, JavaScript, or similar languages',
      'Experience with automation tools and APIs'
    ],
    responsibilities: [
      'Develop internal tools and automation scripts',
      'Collaborate with teams to identify automation opportunities',
      'Maintain and improve existing digital tools',
      'Document technical solutions and processes'
    ],
    skills: ['Python', 'JavaScript', 'REST APIs', 'Automation', 'Git'],
    benefits: ['Health Insurance', 'Flexible Hours', 'Remote Work Options'],
    status: 'open',
    departmentName: 'Engineering'
  },
  {
    title: 'SharePoint Developer',
    description: 'Develop and customize SharePoint solutions for enterprise clients. You will be responsible for building collaborative platforms and document management systems.',
    location: 'Mandaluyong City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'onsite',
    salaryRange: { min: 50000, max: 60000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in IT or related field',
      '3+ years SharePoint development experience',
      'Strong knowledge of SharePoint Online and On-Premise',
      'Experience with Power Platform'
    ],
    responsibilities: [
      'Design and develop SharePoint solutions',
      'Create custom web parts and workflows',
      'Migrate content between SharePoint environments',
      'Provide technical support for SharePoint users'
    ],
    skills: ['SharePoint', 'Power Automate', 'Power Apps', 'JavaScript', 'C#'],
    benefits: ['Health Insurance', 'Performance Bonus', 'Training Allowance'],
    status: 'open',
    departmentName: 'Engineering'
  },
  {
    title: 'Onsite Support Specialist',
    description: 'Provide onsite technical support and troubleshooting for end users. You will be the first point of contact for technical issues and ensure smooth IT operations.',
    location: 'Quezon City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'onsite',
    salaryRange: { min: 16000, max: 18000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in IT or related field',
      '1+ year experience in IT support',
      'Knowledge of Windows, macOS, and common software',
      'Good communication skills'
    ],
    responsibilities: [
      'Provide onsite technical support to users',
      'Troubleshoot hardware and software issues',
      'Install and configure computer systems',
      'Document support tickets and resolutions'
    ],
    skills: ['Windows', 'Hardware Troubleshooting', 'Networking', 'Customer Service'],
    benefits: ['Health Insurance', 'Rice Allowance', 'Transportation Allowance'],
    status: 'open',
    departmentName: 'IT Support'
  },
  {
    title: 'Technical Support Representative',
    description: 'Assist customers with technical issues via phone, email, and chat. You will help resolve customer problems and ensure excellent service delivery.',
    location: 'Mandaluyong City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 19000, max: 25000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree or equivalent experience',
      'Excellent English communication skills',
      'Basic technical knowledge',
      'Customer service experience preferred'
    ],
    responsibilities: [
      'Handle customer inquiries via phone, email, and chat',
      'Troubleshoot technical issues remotely',
      'Escalate complex issues to appropriate teams',
      'Maintain accurate records of customer interactions'
    ],
    skills: ['Customer Service', 'Technical Support', 'Communication', 'Problem Solving'],
    benefits: ['Health Insurance', 'Night Differential', 'Performance Incentives'],
    status: 'open',
    departmentName: 'IT Support'
  },
  {
    title: 'Full Stack Web Developer',
    description: 'Build and maintain web applications with modern frameworks. You will work on both frontend and backend development using cutting-edge technologies.',
    location: 'Quezon City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'remote',
    salaryRange: { min: 30000, max: 40000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '2+ years web development experience',
      'Proficiency in React, Node.js, or similar',
      'Experience with databases (SQL/NoSQL)'
    ],
    responsibilities: [
      'Develop and maintain web applications',
      'Write clean, maintainable code',
      'Collaborate with design and product teams',
      'Participate in code reviews'
    ],
    skills: ['React', 'Node.js', 'MongoDB', 'JavaScript', 'HTML/CSS', 'Git'],
    benefits: ['Health Insurance', 'Remote Work', 'Flexible Hours', 'Learning Budget'],
    status: 'open',
    departmentName: 'Engineering'
  },
  {
    title: 'Systems Programmer',
    description: 'Develop systems-level software and automation scripts. You will work on core infrastructure and system optimization projects.',
    location: 'Quezon City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 18000, max: 25000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '1+ year experience in systems programming',
      'Knowledge of Linux/Unix systems',
      'Scripting skills (Bash, Python)'
    ],
    responsibilities: [
      'Develop and maintain system utilities',
      'Write automation scripts',
      'Monitor system performance',
      'Troubleshoot system issues'
    ],
    skills: ['Linux', 'Python', 'Bash', 'System Administration', 'Networking'],
    benefits: ['Health Insurance', 'Technical Training', 'Meal Allowance'],
    status: 'open',
    departmentName: 'Engineering'
  },
  {
    title: 'UI/UX Web Designer',
    description: 'Design responsive, accessible UI for websites and landing pages. You will create beautiful and functional user interfaces that enhance user experience.',
    location: 'Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 25000, max: 35000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Design or related field',
      '2+ years UI/UX design experience',
      'Proficiency in Figma, Adobe XD, or similar',
      'Understanding of web development basics'
    ],
    responsibilities: [
      'Design user interfaces for web applications',
      'Create wireframes, prototypes, and mockups',
      'Conduct user research and testing',
      'Collaborate with developers on implementation'
    ],
    skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'HTML/CSS'],
    benefits: ['Health Insurance', 'Creative Freedom', 'Flexible Hours'],
    status: 'open',
    departmentName: 'Design'
  },
  {
    title: 'Project Manager',
    description: 'Lead project planning and delivery across cross-functional teams. You will ensure projects are delivered on time, within scope, and budget.',
    location: 'Pasig City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 35000, max: 50000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Business, IT, or related field',
      '3+ years project management experience',
      'PMP or similar certification preferred',
      'Strong leadership and communication skills'
    ],
    responsibilities: [
      'Plan and manage project timelines and resources',
      'Coordinate with stakeholders and team members',
      'Track project progress and report status',
      'Identify and mitigate project risks'
    ],
    skills: ['Project Management', 'Agile', 'Scrum', 'Communication', 'Leadership', 'JIRA'],
    benefits: ['Health Insurance', 'Performance Bonus', 'Career Growth'],
    status: 'open',
    departmentName: 'Operations'
  },
  {
    title: 'Senior Software Developer',
    description: 'Develop and maintain enterprise software solutions. You will lead technical initiatives and mentor junior developers.',
    location: 'Muntinlupa City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'hybrid',
    salaryRange: { min: 55000, max: 75000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in Computer Science or related field',
      '5+ years software development experience',
      'Strong architecture and design skills',
      'Experience leading technical teams'
    ],
    responsibilities: [
      'Design and develop software solutions',
      'Lead technical initiatives and code reviews',
      'Mentor junior developers',
      'Collaborate with product and design teams'
    ],
    skills: ['Java', 'Python', 'Microservices', 'Cloud (AWS/Azure)', 'System Design', 'Git'],
    benefits: ['Health Insurance', 'Stock Options', 'Remote Work', 'Leadership Training'],
    status: 'open',
    departmentName: 'Engineering'
  },
  {
    title: 'IT Helpdesk Analyst',
    description: 'Provide first-level IT support to internal users. You will handle tickets, troubleshoot issues, and ensure user satisfaction.',
    location: 'Makati City, Metro Manila',
    employmentType: 'full-time',
    workArrangement: 'onsite',
    salaryRange: { min: 20000, max: 28000, currency: 'PHP' },
    requirements: [
      'Bachelor\'s degree in IT or related field',
      '1+ year IT helpdesk experience',
      'Knowledge of ITIL practices',
      'Good communication skills'
    ],
    responsibilities: [
      'Handle IT support tickets',
      'Troubleshoot hardware and software issues',
      'Assist with user onboarding',
      'Document solutions in knowledge base'
    ],
    skills: ['IT Support', 'Windows', 'Office 365', 'Ticketing Systems', 'Customer Service'],
    benefits: ['Health Insurance', 'Meal Allowance', 'Training Opportunities'],
    status: 'open',
    departmentName: 'IT Support'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    await Department.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing departments and jobs\n');

    // Create departments
    const createdDepartments = await Department.insertMany(departments);
    console.log(`📁 Created ${createdDepartments.length} departments`);

    // Create a map of department names to IDs
    const deptMap = {};
    createdDepartments.forEach(dept => {
      deptMap[dept.name] = dept._id;
    });

    // Helper function to generate slug
    const slugify = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    };

    // Create jobs with department references
    const jobsWithDepts = sampleJobs.map((job, index) => {
      const { departmentName, ...jobData } = job;
      return {
        ...jobData,
        slug: slugify(job.title) + '-' + (index + 1),
        department: deptMap[departmentName],
        positions: 1,
        positionsFilled: 0,
        applications: 0,
        views: Math.floor(Math.random() * 100) + 10,
        internalOnly: false,
        approvalInfo: {
          status: 'approved',
          approvedAt: new Date()
        }
      };
    });

    const createdJobs = await Job.insertMany(jobsWithDepts);
    console.log(`💼 Created ${createdJobs.length} jobs\n`);

    // Display summary
    console.log('='.repeat(60));
    console.log('SEED COMPLETE\n');
    console.log('Departments:');
    createdDepartments.forEach(dept => {
      const jobCount = jobsWithDepts.filter(j => j.department.toString() === dept._id.toString()).length;
      console.log(`  • ${dept.name} (${dept.code}) - ${jobCount} jobs`);
    });

    console.log('\nJobs:');
    createdJobs.forEach(job => {
      console.log(`  • ${job.title} - ${job.status}`);
    });

    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
};

seedDatabase();
