import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Department from '../models/Department.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const distributeJobs = async () => {
  try {
    console.log('🔄 Starting job distribution to departments...\n');

    // Fetch all departments
    const departments = await Department.find({});
    
    if (departments.length === 0) {
      console.error('❌ No departments found! Please run seedDepartments.js first.');
      process.exit(1);
    }

    // Create department map for easy lookup
    const deptMap = {
      engineering: departments.find(d => d.code === 'ENG')?._id,
      itSupport: departments.find(d => d.code === 'ITS')?._id,
      design: departments.find(d => d.code === 'DES')?._id,
      projectManagement: departments.find(d => d.code === 'PM')?._id,
      hr: departments.find(d => d.code === 'HR')?._id,
      salesMarketing: departments.find(d => d.code === 'SM')?._id
    };

    console.log('📋 Department Map:');
    Object.entries(deptMap).forEach(([key, id]) => {
      const dept = departments.find(d => d._id.equals(id));
      console.log(`   ${dept?.name} (${dept?.code}): ${id}`);
    });
    console.log('');

    // Define job-to-department mappings based on job titles
    const jobMappings = [
      { title: 'Senior Full Stack Developer', department: deptMap.engineering, reason: 'Senior software engineering role' },
      { title: 'Frontend Developer', department: deptMap.engineering, reason: 'Frontend development role' },
      { title: 'IT Support Specialist', department: deptMap.itSupport, reason: 'Technical support role' },
      { title: 'UI/UX Designer', department: deptMap.design, reason: 'Design and user experience role' },
      { title: 'Project Manager', department: deptMap.projectManagement, reason: 'Project management role' },
      { title: 'Junior Software Developer', department: deptMap.engineering, reason: 'Entry-level software development role' }
    ];

    // Update each job
    let updatedCount = 0;
    let notFoundCount = 0;

    console.log('🔄 Updating jobs...\n');

    for (const mapping of jobMappings) {
      const job = await Job.findOne({ title: mapping.title });
      
      if (job) {
        job.department = mapping.department;
        await job.save();
        
        const dept = departments.find(d => d._id.equals(mapping.department));
        console.log(`✅ Updated: "${mapping.title}"`);
        console.log(`   → Assigned to: ${dept?.name} (${dept?.code})`);
        console.log(`   → Reason: ${mapping.reason}\n`);
        
        updatedCount++;
      } else {
        console.log(`⚠️  Job not found: "${mapping.title}"\n`);
        notFoundCount++;
      }
    }

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('📊 Distribution Summary:');
    console.log(`   ✅ Jobs updated: ${updatedCount}`);
    console.log(`   ⚠️  Jobs not found: ${notFoundCount}`);
    console.log('═══════════════════════════════════════════\n');

    // Show department distribution
    console.log('📈 Jobs per Department:');
    for (const dept of departments) {
      const count = await Job.countDocuments({ department: dept._id });
      console.log(`   ${dept.name} (${dept.code}): ${count} jobs`);
    }

    console.log('\n✅ Job distribution completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

distributeJobs();
