import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Department from '../models/Department.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const sampleDepartments = [
  {
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development and technical engineering roles',
    color: '#3b82f6',
    isActive: true
  },
  {
    name: 'IT Support',
    code: 'ITS',
    description: 'Technical support and IT infrastructure',
    color: '#8b5cf6',
    isActive: true
  },
  {
    name: 'Design',
    code: 'DES',
    description: 'UI/UX and creative design',
    color: '#ec4899',
    isActive: true
  },
  {
    name: 'Project Management',
    code: 'PM',
    description: 'Project planning and execution',
    color: '#10b981',
    isActive: true
  },
  {
    name: 'Human Resources',
    code: 'HR',
    description: 'Talent acquisition and employee management',
    color: '#f59e0b',
    isActive: true
  },
  {
    name: 'Sales & Marketing',
    code: 'SM',
    description: 'Sales and marketing operations',
    color: '#ef4444',
    isActive: true
  }
];

const importData = async () => {
  try {
    await Department.deleteMany({});
    const departments = await Department.insertMany(sampleDepartments);

    console.log('✅ Departments imported successfully');
    console.log(`   ${departments.length} departments created`);
    
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code})`);
    });
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Department.deleteMany({});
    console.log('✅ Departments destroyed successfully');
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
