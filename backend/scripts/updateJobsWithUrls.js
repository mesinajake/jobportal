import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  slug: String,
  externalUrl: String
}, { strict: false });

const Job = mongoose.model('Job', jobSchema);

// Company career pages or job board URLs for your local Philippine jobs
const jobUrls = {
  'exl-digital-tool-developer': 'https://www.exlservice.com/careers',
  'information-sharepoint-developer': 'https://www.linkedin.com/company/information-professionals-inc',
  'ntt-onsite-support': 'https://services.global.ntt/en-us/careers',
  'foundever-tech-support': 'https://foundever.com/careers',
  'rarejob-web-developer': 'https://www.rarejob.com.ph/careers',
  'peoplehub-systems-programmer': 'https://www.linkedin.com/company/peoplehub-inc',
  'avantice-web-designer': 'https://avantice.com/careers',
  'unison-project-manager': 'https://www.linkedin.com/company/unison-solutions-delivery-inc',
  'cantier-software-developer': 'https://www.cantiersystems.com/careers',
  'nezda-oracle-consultant': 'https://www.nezda.com/careers',
  'aec-jr-software-developer': 'https://aecdigitalservices.com/careers'
};

async function updateJobUrls() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('📝 Updating jobs with external URLs...');
    let updated = 0;

    for (const [slug, url] of Object.entries(jobUrls)) {
      const result = await Job.updateOne(
        { slug },
        { $set: { externalUrl: url } }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated: ${slug}`);
        updated++;
      } else {
        console.log(`⚠️  Not found or already updated: ${slug}`);
      }
    }

    console.log(`\n🎉 Successfully updated ${updated} jobs with external URLs!`);

  } catch (error) {
    console.error('❌ Error updating jobs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
    process.exit(0);
  }
}

updateJobUrls();
