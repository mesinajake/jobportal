import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const sampleJobs = [
  {
    title: 'Digital - Tool Developer',
    company: 'EXL Service Philippines, Inc.',
    description: 'Build and maintain internal tools and automations to support digital operations. Develop innovative solutions using modern technologies.',
    location: 'Pasay City, Metro Manila',
    salary: '50k - 65k',
    type: 'Full time',
    category: 'Software Development',
    image: '/images/Digital - Tool Developer.jpg',
    slug: 'exl-digital-tool-developer',
    source: 'internal',
    requirements: ['3+ years experience', 'JavaScript proficiency', 'React knowledge'],
    responsibilities: ['Develop internal tools', 'Maintain automation systems', 'Collaborate with teams'],
    benefits: ['Health insurance', 'Competitive salary', 'Career growth'],
    isActive: true
  },
  {
    title: 'SHAREPOINT Developer',
    company: 'Information Professionals, Inc.',
    description: 'Develop and customize SharePoint solutions for enterprise clients. Create workflows and integrate with Microsoft 365.',
    location: 'Mandaluyong City, Metro Manila',
    salary: '50k - 60k',
    type: 'Full time',
    category: 'Software Development',
    image: '/images/SHAREPOINT Developer.jpg',
    slug: 'information-sharepoint-developer',
    source: 'internal',
    requirements: ['SharePoint expertise', 'PowerShell scripting', 'Microsoft 365'],
    responsibilities: ['Customize SharePoint', 'Create workflows', 'Client support'],
    benefits: ['Training programs', 'Health benefits', 'Work-life balance'],
    isActive: true
  },
  {
    title: 'Onsite Support',
    company: 'NTT Philippines Digital Business Solutions, Inc.',
    description: 'Provide on-site technical support to clients. Troubleshoot hardware and software issues.',
    location: 'Quezon City, Metro Manila',
    salary: '16k - 18k',
    type: 'Full time',
    category: 'IT Support',
    image: '/images/Onsite Support.jpg',
    slug: 'ntt-onsite-support',
    source: 'internal',
    requirements: ['Technical support experience', 'Customer service skills', 'Problem-solving'],
    responsibilities: ['On-site support', 'Issue resolution', 'Documentation'],
    benefits: ['Training', 'Transportation allowance', 'Growth opportunities'],
    isActive: true
  },
  {
    title: 'Jr. Software Developer',
    company: 'Tech Solutions Inc.',
    description: 'Join our development team to build web applications. Great opportunity for fresh graduates.',
    location: 'Makati City, Metro Manila',
    salary: '25k - 35k',
    type: 'Full time',
    category: 'Software Development',
    image: '/images/Jr. Software Developer.jpg',
    slug: 'tech-solutions-jr-software-developer',
    source: 'internal',
    requirements: ['Basic programming knowledge', 'Fresh graduate welcome', 'Eager to learn'],
    responsibilities: ['Code development', 'Testing', 'Documentation'],
    benefits: ['Training programs', 'Mentorship', 'Career path'],
    isActive: true
  },
  {
    title: 'Web Designer',
    company: 'Creative Digital Agency',
    description: 'Create stunning web designs for our clients. Work with modern design tools and frameworks.',
    location: 'Taguig City, Metro Manila',
    salary: '30k - 45k',
    type: 'Full time',
    category: 'Design',
    image: '/images/Web Designer.jpg',
    slug: 'creative-web-designer',
    source: 'internal',
    requirements: ['Adobe Creative Suite', 'UI/UX principles', 'Portfolio required'],
    responsibilities: ['Design websites', 'Create mockups', 'Client presentations'],
    benefits: ['Creative environment', 'Latest tools', 'Flexible hours'],
    isActive: true
  },
  {
    title: 'Project Manager',
    company: 'Enterprise Solutions Corp',
    description: 'Lead project teams and ensure successful delivery of IT projects.',
    location: 'Bonifacio Global City, Taguig',
    salary: '60k - 80k',
    type: 'Full time',
    category: 'Project Management',
    image: '/images/ProjectManager.jpg',
    slug: 'enterprise-project-manager',
    source: 'internal',
    requirements: ['PMP certification preferred', '5+ years experience', 'Leadership skills'],
    responsibilities: ['Project planning', 'Team management', 'Stakeholder communication'],
    benefits: ['Competitive salary', 'Bonuses', 'Leadership training'],
    isActive: true
  }
];

const importData = async () => {
  try {
    await Job.deleteMany({});
    await Job.insertMany(sampleJobs);

    console.log('✅ Sample jobs imported successfully');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Job.deleteMany({});

    console.log('✅ Data destroyed successfully');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
