export const jobs = [
  {
    slug: 'exl-digital-tool-developer',
    title: 'Digital - Tool Developer',
    company: 'EXL Service Philippines, Inc.',
    posted: '2 days ago',
    location: 'Pasay City, Metro Manila',
    salary: '50k - 65k',
    type: 'Full time',
    image: '/images/Digital - Tool Developer.jpg',
    description: 'Build and maintain internal tools and automations to support digital operations.'
  },
  {
    slug: 'information-sharepoint-developer',
    title: 'SHAREPOINT Developer',
    company: 'Information Professonals, Inc.',
    posted: '13 days ago',
    location: 'Mandaluyong City, Metro Manila', 
    salary: '50k - 60k',
    type: 'Full time',
    image: '/images/SHAREPOINT Developer.jpg',
    description: 'Develop and customize SharePoint solutions for enterprise clients.'
  },
  {
    slug: 'ntt-onsite-support',
    title: 'Onsite Support',
    company: 'NTT Philippines Digital Business Solutions, Inc.',
    posted: '24 days ago',
    location: 'Quezon City, Metro Manila',
    salary: '16k - 18k',
    type: 'Full time',
    image: '/images/Onsite Support.jpg',
    description: 'Provide onsite technical support and troubleshooting for end users.'
  },
  {
    slug: 'foundever-tech-support',
    title: 'Tech Support',
    company: 'Foundever™',
    posted: '29 days ago',
    location: 'Mandaluyong City, Metro Manila',
    salary: '19k - 25k',
    type: 'Full time',
    image: '/images/No Tech Support.png',
    description: 'Assist customers with technical issues via phone, email, and chat.'
  },
  {
    slug: 'rarejob-web-developer',
    title: 'Web Developer',
    company: 'RareJob Philippines, Inc.',
    posted: '3 days ago',
    location: 'Quezon City, Metro Manila',
    salary: '30k - 40k',
    type: 'Full time',
    image: '/images/Web Developer.jpg',
    description: 'Build and maintain web applications with modern frameworks.'
  },
  {
    slug: 'peoplehub-systems-programmer',
    title: 'Systems Programmer',
    company: 'PeopleHub, Inc.',
    posted: '8h ago',
    location: 'Quezon City, Metro Manila',
    salary: '18k - 25k',
    type: 'Full time',
    image: '/images/Systems Programmer.jpg',
    description: 'Develop systems-level software and automation scripts.'
  },
  {
    slug: 'avantice-web-designer',
    title: 'Web Designer',
    company: 'Avantice Corporation',
    posted: '13d ago',
    location: 'Metro Manila',
    salary: '25k - 35k',
    type: 'Full time',
    image: '/images/Web Designer.jpg',
    description: 'Design responsive, accessible UI for websites and landing pages.'
  },
  {
    slug: 'unison-project-manager',
    title: 'Project Manager',
    company: 'Unison Solutions Delivery, Inc.',
    posted: '3d ago',
    location: 'Pasig City, Metro Manila',
    salary: '15k - 16k',
    type: 'Full time',
    image: '/images/ProjectManager.jpg',
    description: 'Lead project planning and delivery across cross-functional teams.'
  },
  {
    slug: 'cantier-software-developer',
    title: 'Software Developer',
    company: 'CANTIER SYSTEMS, INC',
    posted: '22d ago',
    location: 'Muntinlupa City, Metro Manila',
    salary: '35k - 50k',
    type: 'Full time',
    image: '/images/Software Developer.jpg',
    description: 'Develop and maintain enterprise software solutions.'
  },
  {
    slug: 'nezda-oracle-consultant',
    title: 'Oracle Consultant',
    company: 'Nezda Technologies, Inc',
    posted: '14d ago',
    location: 'Metro Manila',
    salary: '80k - 110k',
    type: 'Full time',
    image: '/images/Oracle Consultant.jpg',
    description: 'Implement and optimize Oracle-based solutions for clients.'
  },
  {
    slug: 'aec-jr-software-developer',
    title: 'Jr. Software Developer',
    company: 'AEC Digital Services',
    posted: '9d ago',
    location: 'Pasig  City, Metro Manila',
    salary: '35k - 45k',
    type: 'Full time',
    image: '/images/Jr. Software Developer.jpg',
    description: 'Assist in building features and fixing bugs in web apps.'
  }
]

export function getJobBySlug(slug) {
  return jobs.find(j => j.slug === slug)
}
