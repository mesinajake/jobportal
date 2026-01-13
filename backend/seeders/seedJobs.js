import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Job from '../models/Job.js';
import Department from '../models/Department.js';
import connectDB from '../config/db.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const importData = async () => {
  try {
    // Clear existing data first
    await Department.deleteMany({});
    await Job.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    // Create departments
    const departments = await Department.insertMany([
      {
        name: 'Engineering',
        code: 'ENG',
        description: 'Software development and technical roles',
        color: '#3b82f6',
        isActive: true
      },
      {
        name: 'IT Support',
        code: 'ITS',
        description: 'Technical support and infrastructure',
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
        description: 'HR and talent acquisition',
        color: '#f59e0b',
        isActive: true
      }
    ]);
    console.log('✅ Departments created');

    // Map department names to IDs
    const deptMap = {};
    departments.forEach(dept => {
      deptMap[dept.name] = dept._id;
    });

    console.log('\n📋 Available departments:');
    departments.forEach(dept => {
      console.log(`   - ${dept.name} (${dept.code})`);
    });
    console.log('');

    // Clear existing jobs
    await Job.deleteMany({});

    const sampleJobs = [
      {
        title: 'Senior Full Stack Developer',
        department: deptMap['Engineering'],
        slug: 'senior-full-stack-developer',
        description: 'We are looking for an experienced Full Stack Developer to join our engineering team. You will work on building scalable web applications using modern technologies like React, Node.js, and MongoDB.\n\nYou will collaborate with cross-functional teams to design, develop, and deploy high-quality software solutions.',
        location: 'Makati City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 80000,
          max: 120000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          '5+ years of professional software development experience',
          'Strong proficiency in JavaScript, React, and Node.js',
          'Experience with MongoDB or other NoSQL databases',
          'Understanding of RESTful APIs and microservices architecture',
          'Experience with Git and modern development workflows'
        ],
        responsibilities: [
          'Design and develop scalable web applications',
          'Write clean, maintainable, and well-documented code',
          'Collaborate with product managers and designers',
          'Participate in code reviews and technical discussions',
          'Mentor junior developers'
        ],
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'Git', 'REST APIs', 'Agile'],
        benefits: [
          'Health insurance (HMO)',
          'Performance bonuses',
          'Flexible work schedule',
          'Professional development budget',
          'Modern equipment provided'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Frontend Developer',
        department: deptMap['Engineering'],
        slug: 'frontend-developer',
        description: 'Join our team as a Frontend Developer and help create beautiful, responsive user interfaces. You will work with React and modern CSS frameworks to build engaging web applications.',
        location: 'Quezon City, Metro Manila',
        locationDetails: {
          workArrangement: 'remote'
        },
        salaryRange: {
          min: 50000,
          max: 75000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requirements: [
          '3+ years of frontend development experience',
          'Proficiency in React and modern JavaScript (ES6+)',
          'Experience with CSS frameworks (Tailwind, Bootstrap)',
          'Understanding of responsive design principles',
          'Portfolio of previous work required'
        ],
        responsibilities: [
          'Build responsive and accessible user interfaces',
          'Implement designs from Figma/Adobe XD',
          'Optimize application performance',
          'Collaborate with backend developers',
          'Ensure cross-browser compatibility'
        ],
        skills: ['React', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Git', 'Responsive Design'],
        benefits: [
          'Work from home',
          'Health insurance',
          'Internet allowance',
          'Flexible hours',
          'Career growth opportunities'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'IT Support Specialist',
        department: deptMap['IT Support'],
        slug: 'it-support-specialist',
        description: 'Provide technical support to end users and maintain IT infrastructure. Help troubleshoot hardware and software issues and ensure smooth operations.',
        location: 'Pasig City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 25000,
          max: 35000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
        requirements: [
          'Basic understanding of computer systems and networks',
          'Good communication and customer service skills',
          'Ability to troubleshoot hardware and software issues',
          'Fresh graduates with IT background welcome to apply'
        ],
        responsibilities: [
          'Provide first-level technical support',
          'Install and configure computer hardware and software',
          'Maintain IT equipment inventory',
          'Document support tickets and resolutions',
          'Assist with network and server maintenance'
        ],
        skills: ['Windows', 'Microsoft Office', 'Networking Basics', 'Troubleshooting', 'Customer Service'],
        benefits: [
          'Health insurance',
          'Transportation allowance',
          'Training and certification support',
          'Career advancement opportunities'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'UI/UX Designer',
        department: deptMap['Design'],
        slug: 'ui-ux-designer',
        description: 'Create intuitive and visually appealing user interfaces for web and mobile applications. Work closely with developers and product managers to deliver exceptional user experiences.',
        location: 'Taguig City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 45000,
          max: 65000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requirements: [
          '3+ years of UI/UX design experience',
          'Proficiency in Figma or Adobe XD',
          'Strong portfolio demonstrating design thinking',
          'Understanding of user-centered design principles',
          'Knowledge of HTML/CSS is a plus'
        ],
        responsibilities: [
          'Create wireframes, prototypes, and high-fidelity mockups',
          'Conduct user research and usability testing',
          'Design responsive interfaces for web and mobile',
          'Collaborate with developers to ensure design implementation',
          'Maintain design system and style guides'
        ],
        skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping', 'User Testing', 'Design Systems'],
        benefits: [
          'Creative work environment',
          'Latest design tools and software',
          'Flexible work schedule',
          'Health insurance',
          'Professional development'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Project Manager',
        department: deptMap['Project Management'],
        slug: 'project-manager',
        description: 'Lead software development projects from initiation to delivery. Coordinate with stakeholders, manage timelines, and ensure successful project outcomes.',
        location: 'Bonifacio Global City, Taguig',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 70000,
          max: 100000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          '5+ years of project management experience in IT',
          'PMP or Scrum Master certification preferred',
          'Strong leadership and communication skills',
          'Experience with Agile/Scrum methodologies',
          'Proven track record of successful project delivery'
        ],
        responsibilities: [
          'Plan and execute software development projects',
          'Manage project scope, timeline, and budget',
          'Coordinate with cross-functional teams',
          'Facilitate Scrum ceremonies and sprint planning',
          'Report project status to stakeholders',
          'Identify and mitigate project risks'
        ],
        skills: ['Project Management', 'Agile', 'Scrum', 'JIRA', 'Stakeholder Management', 'Leadership', 'Risk Management'],
        benefits: [
          'Competitive salary package',
          'Performance bonuses',
          'Health insurance for family',
          'Leadership development programs',
          'Hybrid work setup'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Scrum Master',
        department: deptMap['Project Management'],
        slug: 'scrum-master',
        description: 'Guide development teams in Agile practices and facilitate Scrum ceremonies. You will remove impediments, coach teams, and ensure continuous improvement in development processes.',
        location: 'Makati City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 55000,
          max: 75000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requirements: [
          'Certified Scrum Master (CSM) or equivalent',
          '3+ years experience as Scrum Master',
          'Strong understanding of Agile methodologies',
          'Experience with software development teams',
          'Excellent facilitation and coaching skills'
        ],
        responsibilities: [
          'Facilitate daily standups, sprint planning, and retrospectives',
          'Remove impediments blocking team progress',
          'Coach team members on Agile best practices',
          'Track sprint progress and velocity metrics',
          'Foster continuous improvement culture',
          'Shield team from external distractions'
        ],
        skills: ['Scrum', 'Agile', 'Facilitation', 'Coaching', 'JIRA', 'Conflict Resolution', 'Servant Leadership'],
        benefits: [
          'Health insurance',
          'Scrum certifications support',
          'Performance bonuses',
          'Flexible work schedule',
          'Professional development'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Product Owner',
        department: deptMap['Project Management'],
        slug: 'product-owner',
        description: 'Define product vision and manage product backlog to maximize value delivery. You will work closely with stakeholders to prioritize features and guide development teams.',
        location: 'Taguig City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 65000,
          max: 90000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          'Bachelor\'s degree in Business, IT, or related field',
          '5+ years product management experience',
          'CSPO certification preferred',
          'Strong analytical and decision-making skills',
          'Experience with product development lifecycle'
        ],
        responsibilities: [
          'Define and communicate product vision',
          'Manage and prioritize product backlog',
          'Write clear user stories and acceptance criteria',
          'Make decisions on feature prioritization',
          'Collaborate with stakeholders on requirements',
          'Accept completed work and provide feedback'
        ],
        skills: ['Product Management', 'Backlog Management', 'User Stories', 'Agile', 'Stakeholder Management', 'Data Analysis', 'JIRA'],
        benefits: [
          'Competitive compensation',
          'Health insurance with dependents',
          'Performance-based incentives',
          'Product management training',
          'Career advancement opportunities'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Technical Project Manager',
        department: deptMap['Project Management'],
        slug: 'technical-project-manager',
        description: 'Lead complex technical projects with deep understanding of software architecture and development. You will bridge the gap between technical teams and business stakeholders.',
        location: 'Quezon City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 75000,
          max: 110000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          '5+ years technical project management experience',
          'Strong technical background in software development',
          'PMP or similar certification preferred',
          'Experience with cloud technologies and DevOps'
        ],
        responsibilities: [
          'Lead technical projects from conception to delivery',
          'Translate technical requirements for stakeholders',
          'Manage technical risks and dependencies',
          'Coordinate with architects and senior developers',
          'Oversee technical implementations and reviews',
          'Ensure adherence to technical standards'
        ],
        skills: ['Technical Project Management', 'Software Development', 'Cloud Architecture', 'DevOps', 'Risk Management', 'Agile', 'Leadership'],
        benefits: [
          'Premium salary package',
          'Health insurance for family',
          'Technical certifications support',
          'Performance bonuses',
          'Latest technology tools'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'PMO Analyst',
        department: deptMap['Project Management'],
        slug: 'pmo-analyst',
        description: 'Support the Project Management Office by tracking project metrics, maintaining documentation, and ensuring project governance. Great opportunity for someone starting their PM career.',
        location: 'Pasig City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 28000,
          max: 38000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
        requirements: [
          'Bachelor\'s degree in Business, IT, or related field',
          'Fresh graduates or 1+ year PMO experience',
          'Strong analytical and organizational skills',
          'Proficiency in Excel and project management tools',
          'Excellent attention to detail'
        ],
        responsibilities: [
          'Track project progress and maintain status reports',
          'Update project documentation and repositories',
          'Prepare presentations for stakeholders',
          'Assist with resource allocation and scheduling',
          'Monitor project budgets and timelines',
          'Support project managers with administrative tasks'
        ],
        skills: ['Project Tracking', 'Excel', 'PowerPoint', 'Documentation', 'JIRA', 'Data Analysis', 'Communication'],
        benefits: [
          'Health insurance',
          'Project management training',
          'Mentorship program',
          'Career growth opportunities',
          'Certification support'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Agile Coach',
        department: deptMap['Project Management'],
        slug: 'agile-coach',
        description: 'Drive Agile transformation across the organization and coach teams on Agile principles. You will mentor Scrum Masters, facilitate workshops, and promote Agile culture at scale.',
        location: 'Bonifacio Global City, Taguig',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 80000,
          max: 120000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          'SAFe, LeSS, or equivalent Agile scaling certification',
          '7+ years Agile experience with 3+ years coaching',
          'Deep expertise in Scrum, Kanban, and SAFe',
          'Experience leading Agile transformations',
          'Exceptional facilitation and coaching abilities'
        ],
        responsibilities: [
          'Coach teams and leaders on Agile practices',
          'Lead Agile transformation initiatives',
          'Design and facilitate Agile workshops',
          'Mentor Scrum Masters and Product Owners',
          'Assess and improve team maturity levels',
          'Drive continuous improvement across organization'
        ],
        skills: ['Agile Coaching', 'SAFe', 'Scrum', 'Kanban', 'Change Management', 'Facilitation', 'Leadership', 'Organizational Development'],
        benefits: [
          'Premium compensation package',
          'Comprehensive health insurance',
          'Agile certifications and training',
          'Conference attendance',
          'Flexible schedule',
          'Professional development budget'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Junior Software Developer',
        department: deptMap['Engineering'],
        slug: 'junior-software-developer',
        description: 'Start your career as a software developer! Learn from experienced engineers while contributing to real-world projects. Perfect opportunity for fresh graduates.',
        location: 'Ortigas, Pasig City',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 30000,
          max: 40000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
        requirements: [
          'Bachelor\'s degree in Computer Science or related field',
          'Basic knowledge of programming (Java, Python, or JavaScript)',
          'Understanding of data structures and algorithms',
          'Eagerness to learn and grow',
          'Fresh graduates welcome'
        ],
        responsibilities: [
          'Write and maintain code under supervision',
          'Participate in code reviews',
          'Debug and fix software issues',
          'Learn development best practices',
          'Collaborate with team members'
        ],
        skills: ['JavaScript', 'Python', 'Java', 'Git', 'Problem Solving'],
        benefits: [
          'Mentorship program',
          'Training and certification support',
          'Health insurance',
          'Career growth path',
          'Modern office environment'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Digital Tool Developer',
        department: deptMap['Engineering'],
        slug: 'digital-tool-developer',
        description: 'Build and maintain internal tools and automations to support digital operations. You will work with modern technologies to create efficient solutions that streamline our business processes.',
        location: 'Pasay City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 50000,
          max: 65000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
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
        benefits: [
          'Health Insurance',
          'Flexible Hours',
          'Remote Work Options',
          'Learning allowance'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'SharePoint Developer',
        department: deptMap['Engineering'],
        slug: 'sharepoint-developer',
        description: 'Develop and customize SharePoint solutions for enterprise clients. You will be responsible for building collaborative platforms and document management systems.',
        location: 'Mandaluyong City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 50000,
          max: 60000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
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
        benefits: [
          'Health Insurance',
          'Performance Bonus',
          'Training Allowance',
          'HMO coverage'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Onsite Support Specialist',
        department: deptMap['IT Support'],
        slug: 'onsite-support-specialist',
        description: 'Provide onsite technical support and troubleshooting for end users. You will be the first point of contact for technical issues and ensure smooth IT operations.',
        location: 'Quezon City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 16000,
          max: 18000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
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
        benefits: [
          'Health Insurance',
          'Rice Allowance',
          'Transportation Allowance',
          'On-the-job training'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Technical Support Representative',
        department: deptMap['IT Support'],
        slug: 'technical-support-representative',
        description: 'Assist customers with technical issues via phone, email, and chat. You will help resolve customer problems and ensure excellent service delivery.',
        location: 'Mandaluyong City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 19000,
          max: 25000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
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
        benefits: [
          'Health Insurance',
          'Night Differential',
          'Performance Incentives',
          'Career advancement'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Full Stack Web Developer',
        department: deptMap['Engineering'],
        slug: 'full-stack-web-developer',
        description: 'Build and maintain web applications with modern frameworks. You will work on both frontend and backend development using cutting-edge technologies.',
        location: 'Quezon City, Metro Manila',
        locationDetails: {
          workArrangement: 'remote'
        },
        salaryRange: {
          min: 30000,
          max: 40000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
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
        benefits: [
          'Health Insurance',
          'Remote Work',
          'Flexible Hours',
          'Learning Budget'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Systems Programmer',
        department: deptMap['Engineering'],
        slug: 'systems-programmer',
        description: 'Develop systems-level software and automation scripts. You will work on core infrastructure and system optimization projects.',
        location: 'Quezon City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 18000,
          max: 25000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
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
        benefits: [
          'Health Insurance',
          'Technical Training',
          'Meal Allowance',
          'Certification support'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'UI/UX Web Designer',
        department: deptMap['Design'],
        slug: 'ui-ux-web-designer',
        description: 'Design responsive, accessible UI for websites and landing pages. You will create beautiful and functional user interfaces that enhance user experience.',
        location: 'Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 25000,
          max: 35000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
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
        benefits: [
          'Health Insurance',
          'Creative Freedom',
          'Flexible Hours',
          'Design tools subscription'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Senior Software Developer',
        department: deptMap['Engineering'],
        slug: 'senior-software-developer',
        description: 'Develop and maintain enterprise software solutions. You will lead technical initiatives and mentor junior developers.',
        location: 'Muntinlupa City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 55000,
          max: 75000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
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
        benefits: [
          'Health Insurance',
          'Stock Options',
          'Remote Work',
          'Leadership Training'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'IT Helpdesk Analyst',
        department: deptMap['IT Support'],
        slug: 'it-helpdesk-analyst',
        description: 'Provide first-level IT support to internal users. You will handle tickets, troubleshoot issues, and ensure user satisfaction.',
        location: 'Makati City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 20000,
          max: 28000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
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
        benefits: [
          'Health Insurance',
          'Meal Allowance',
          'Training Opportunities',
          'ITIL certification support'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'HR Manager',
        department: deptMap['Human Resources'],
        slug: 'hr-manager',
        description: 'Lead the HR department and drive people strategies that align with business objectives. You will oversee talent acquisition, employee relations, performance management, and organizational development initiatives.',
        location: 'Makati City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 60000,
          max: 85000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          'Bachelor\'s degree in HR Management, Psychology, or related field',
          '7+ years of progressive HR experience',
          '3+ years in HR leadership role',
          'Strong knowledge of Philippine labor laws',
          'Experience with HRIS systems and HR analytics'
        ],
        responsibilities: [
          'Develop and implement HR strategies and initiatives',
          'Oversee recruitment, onboarding, and retention programs',
          'Manage employee relations and conflict resolution',
          'Ensure compliance with labor laws and regulations',
          'Lead performance management and succession planning',
          'Partner with leadership on organizational development'
        ],
        skills: ['HR Strategy', 'Leadership', 'Labor Law', 'Employee Relations', 'HRIS', 'Performance Management', 'Talent Development'],
        benefits: [
          'Competitive salary package',
          'Health insurance for dependents',
          'Performance bonuses',
          'Professional development budget',
          'Flexible work arrangement'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'Talent Acquisition Specialist',
        department: deptMap['Human Resources'],
        slug: 'talent-acquisition-specialist',
        description: 'Source, attract, and hire top talent to build a world-class team. You will manage the full recruitment cycle and create exceptional candidate experiences.',
        location: 'Taguig City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 35000,
          max: 50000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requirements: [
          'Bachelor\'s degree in HR, Psychology, or related field',
          '3+ years of recruitment experience',
          'Experience with IT/Tech hiring preferred',
          'Proficiency in applicant tracking systems',
          'Strong networking and sourcing skills'
        ],
        responsibilities: [
          'Manage end-to-end recruitment process',
          'Source candidates through various channels',
          'Conduct phone screenings and interviews',
          'Coordinate with hiring managers on requirements',
          'Build and maintain talent pipeline',
          'Negotiate offers and close candidates'
        ],
        skills: ['Recruitment', 'Sourcing', 'Interviewing', 'LinkedIn Recruiter', 'ATS', 'Candidate Assessment', 'Employer Branding'],
        benefits: [
          'Health insurance',
          'Performance incentives',
          'Flexible work schedule',
          'Career advancement opportunities',
          'Training and certifications'
        ],
        status: 'open',
        isActive: true,
        featured: true
      },
      {
        title: 'HR Business Partner',
        department: deptMap['Human Resources'],
        slug: 'hr-business-partner',
        description: 'Act as a strategic partner to business leaders and drive HR initiatives that support organizational goals. You will provide consultative support on talent management, employee engagement, and organizational effectiveness.',
        location: 'Bonifacio Global City, Taguig',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 50000,
          max: 70000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'senior',
        requirements: [
          'Bachelor\'s degree in HR or Business Administration',
          '5+ years HR experience with 2+ years as HRBP',
          'Strong business acumen and analytical skills',
          'Experience in change management',
          'Excellent stakeholder management skills'
        ],
        responsibilities: [
          'Partner with business leaders on people strategies',
          'Drive organizational development initiatives',
          'Provide coaching and guidance to managers',
          'Lead talent development and succession planning',
          'Analyze HR metrics and provide insights',
          'Manage employee engagement programs'
        ],
        skills: ['HR Business Partnering', 'Strategic Planning', 'Change Management', 'Coaching', 'HR Analytics', 'Organizational Development'],
        benefits: [
          'Comprehensive health insurance',
          'Performance bonuses',
          'Leadership training programs',
          'Flexible hours',
          'Professional certifications support'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Recruitment Coordinator',
        department: deptMap['Human Resources'],
        slug: 'recruitment-coordinator',
        description: 'Support the recruitment team by coordinating interview schedules, managing candidate communications, and ensuring smooth hiring processes. Perfect for someone starting their HR career.',
        location: 'Pasig City, Metro Manila',
        locationDetails: {
          workArrangement: 'onsite'
        },
        salaryRange: {
          min: 22000,
          max: 30000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'entry',
        requirements: [
          'Bachelor\'s degree in HR, Psychology, or related field',
          'Fresh graduates or 1+ year recruitment experience',
          'Excellent organizational and communication skills',
          'Proficient in MS Office and Google Workspace',
          'Attention to detail and multitasking ability'
        ],
        responsibilities: [
          'Schedule and coordinate interviews',
          'Communicate with candidates throughout hiring process',
          'Maintain applicant tracking system',
          'Prepare job postings and advertisements',
          'Assist with pre-employment requirements',
          'Support onboarding activities'
        ],
        skills: ['Recruitment Coordination', 'Scheduling', 'Communication', 'ATS Management', 'MS Office', 'Organization'],
        benefits: [
          'Health insurance',
          'Training and development',
          'Career growth path',
          'Meal allowance',
          'Supportive team environment'
        ],
        status: 'open',
        isActive: true
      },
      {
        title: 'Compensation and Benefits Specialist',
        department: deptMap['Human Resources'],
        slug: 'compensation-and-benefits-specialist',
        description: 'Design and administer competitive compensation and benefits programs that attract and retain top talent. You will analyze market trends, manage payroll, and ensure compliance with regulations.',
        location: 'Makati City, Metro Manila',
        locationDetails: {
          workArrangement: 'hybrid'
        },
        salaryRange: {
          min: 40000,
          max: 55000,
          currency: 'PHP'
        },
        employmentType: 'full-time',
        experienceLevel: 'mid',
        requirements: [
          'Bachelor\'s degree in HR, Finance, or related field',
          '3+ years compensation and benefits experience',
          'Knowledge of Philippine labor laws and tax regulations',
          'Strong analytical and Excel skills',
          'Experience with payroll systems'
        ],
        responsibilities: [
          'Manage compensation structure and salary benchmarking',
          'Administer employee benefits programs',
          'Oversee payroll processing and accuracy',
          'Ensure compliance with SSS, PhilHealth, Pag-IBIG',
          'Conduct market research on compensation trends',
          'Prepare C&B reports and analytics'
        ],
        skills: ['Compensation Analysis', 'Benefits Administration', 'Payroll', 'Excel', 'Labor Law', 'HRIS', 'Data Analysis'],
        benefits: [
          'Health insurance with dependents',
          'Retirement plan',
          'Performance bonuses',
          'Certification support',
          'Flexible work setup'
        ],
        status: 'open',
        isActive: true
      }
    ];

    await Job.insertMany(sampleJobs);

    console.log('✅ Sample jobs imported successfully');
    console.log(`   ${sampleJobs.length} jobs created\n`);
    
    console.log('═══════════════════════════════════════════');
    console.log('📊 Jobs per Department:');
    departments.forEach(dept => {
      const count = sampleJobs.filter(j => j.department.toString() === dept._id.toString()).length;
      console.log(`   ${dept.name} (${dept.code}): ${count} jobs`);
    });
    console.log('═══════════════════════════════════════════');
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Job.deleteMany({});
    console.log('✅ Jobs destroyed successfully');
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
