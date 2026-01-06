import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';

dotenv.config();

const viewJobs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const jobs = await Job.find({}).lean();
    
    console.log(`Found ${jobs.length} jobs:\n`);
    console.log('='.repeat(80));
    
    jobs.forEach((job, index) => {
      console.log(`\n[${index + 1}] ${job.title}`);
      console.log(`    ID: ${job._id}`);
      console.log(`    Status: ${job.status || 'N/A'}`);
      console.log(`    Location: ${job.location || 'N/A'}`);
      console.log(`    Type: ${job.employmentType || job.type || 'N/A'}`);
      console.log(`    Department: ${job.department || 'N/A'}`);
      console.log(`    Created: ${job.createdAt || 'N/A'}`);
      if (job.salaryRange) {
        console.log(`    Salary: ${job.salaryRange.min} - ${job.salaryRange.max}`);
      }
    });

    console.log('\n' + '='.repeat(80));
    console.log('\nFull job objects (JSON):');
    console.log(JSON.stringify(jobs, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

viewJobs();
