import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Job model schema (matching your backend model)
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  salary: String,
  type: {
    type: String,
    enum: ['full_time', 'part_time', 'contract', 'temporary', 'internship'],
    default: 'full_time'
  },
  posted: {
    type: Date,
    default: Date.now
  },
  image: String,
  slug: {
    type: String,
    unique: true
  },
  externalUrl: String,
  source: {
    type: String,
    default: 'manual'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

// Static jobs data from your jobs.js file
const jobs = [
  {
    slug: 'exl-digital-tool-developer',
    title: 'Digital - Tool Developer',
    company: 'EXL Service Philippines, Inc.',
    posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    location: 'Pasay City, Metro Manila',
    salary: '50k - 65k',
    type: 'full_time',
    image: '/images/Digital - Tool Developer.jpg',
    description: 'Build and maintain internal tools and automations to support digital operations.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'information-sharepoint-developer',
    title: 'SHAREPOINT Developer',
    company: 'Information Professonals, Inc.',
    posted: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    location: 'Mandaluyong City, Metro Manila',
    salary: '50k - 60k',
    type: 'full_time',
    image: '/images/SHAREPOINT Developer.jpg',
    description: 'Develop and customize SharePoint solutions for enterprise clients.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'ntt-onsite-support',
    title: 'Onsite Support',
    company: 'NTT Philippines Digital Business Solutions, Inc.',
    posted: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
    location: 'Quezon City, Metro Manila',
    salary: '16k - 18k',
    type: 'full_time',
    image: '/images/Onsite Support.jpg',
    description: 'Provide onsite technical support and troubleshooting for end users.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'foundever-tech-support',
    title: 'Tech Support',
    company: 'Foundever™',
    posted: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000), // 29 days ago
    location: 'Mandaluyong City, Metro Manila',
    salary: '19k - 25k',
    type: 'full_time',
    image: '/images/No Tech Support.png',
    description: 'Assist customers with technical issues via phone, email, and chat.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'rarejob-web-developer',
    title: 'Web Developer',
    company: 'RareJob Philippines, Inc.',
    posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    location: 'Quezon City, Metro Manila',
    salary: '30k - 40k',
    type: 'full_time',
    image: '/images/Web Developer.jpg',
    description: 'Build and maintain web applications with modern frameworks.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'peoplehub-systems-programmer',
    title: 'Systems Programmer',
    company: 'PeopleHub, Inc.',
    posted: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    location: 'Quezon City, Metro Manila',
    salary: '18k - 25k',
    type: 'full_time',
    image: '/images/Systems Programmer.jpg',
    description: 'Develop systems-level software and automation scripts.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'avantice-web-designer',
    title: 'Web Designer',
    company: 'Avantice Corporation',
    posted: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), // 13 days ago
    location: 'Metro Manila',
    salary: '25k - 35k',
    type: 'full_time',
    image: '/images/Web Designer.jpg',
    description: 'Design responsive, accessible UI for websites and landing pages.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'unison-project-manager',
    title: 'Project Manager',
    company: 'Unison Solutions Delivery, Inc.',
    posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    location: 'Pasig City, Metro Manila',
    salary: '15k - 16k',
    type: 'full_time',
    image: '/images/ProjectManager.jpg',
    description: 'Lead project planning and delivery across cross-functional teams.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'cantier-software-developer',
    title: 'Software Developer',
    company: 'CANTIER SYSTEMS, INC',
    posted: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000), // 22 days ago
    location: 'Muntinlupa City, Metro Manila',
    salary: '35k - 50k',
    type: 'full_time',
    image: '/images/Software Developer.jpg',
    description: 'Develop and maintain enterprise software solutions.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'nezda-oracle-consultant',
    title: 'Oracle Consultant',
    company: 'Nezda Technologies, Inc',
    posted: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    location: 'Metro Manila',
    salary: '80k - 110k',
    type: 'full_time',
    image: '/images/Oracle Consultant.jpg',
    description: 'Implement and optimize Oracle-based solutions for clients.',
    source: 'manual',
    isActive: true
  },
  {
    slug: 'aec-jr-software-developer',
    title: 'Jr. Software Developer',
    company: 'AEC Digital Services',
    posted: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    location: 'Pasig City, Metro Manila',
    salary: '35k - 45k',
    type: 'full_time',
    image: '/images/Jr. Software Developer.jpg',
    description: 'Assist in building features and fixing bugs in web apps.',
    source: 'manual',
    isActive: true
  }
];

// Connect to MongoDB and seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing manual jobs (optional - comment out if you want to keep existing jobs)
    console.log('🗑️  Clearing existing manual jobs...');
    await Job.deleteMany({ source: 'manual' });
    console.log('✅ Cleared existing manual jobs');

    // Insert new jobs
    console.log('📝 Inserting jobs...');
    const result = await Job.insertMany(jobs);
    console.log(`✅ Successfully inserted ${result.length} jobs!`);

    // Display inserted jobs
    console.log('\n📋 Inserted Jobs:');
    result.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title} at ${job.company} (${job.location})`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedDatabase();
