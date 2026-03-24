const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env.local');
const uri = fs.readFileSync(envPath, 'utf8').match(/MONGODB_URI=(.+)/)?.[1]?.trim();

if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

const MEMBERS = [
  {
    name: 'Tomás Deluca',
    email: '_seed_tomas@nordeltabuild',
    initials: 'TD',
    role: 'Founder/CEO',
    jobTitle: 'Founder',
    company: 'huevsite.io',
    companyUrl: 'https://huevsite.io',
    tags: ['Founder', 'Builder'],
    colorIndex: 0,
    status: 'active',
    createdAt: new Date('2025-01-01T00:00:00Z'),
  },
  {
    name: 'Lucas Argento',
    email: '_seed_lucas@nordeltabuild',
    initials: 'LA',
    role: 'Founder/CEO',
    jobTitle: 'Founder',
    company: 'trysupplai.com',
    companyUrl: 'https://trysupplai.com',
    tags: ['AI', 'Founder'],
    colorIndex: 1,
    status: 'active',
    createdAt: new Date('2025-01-02T00:00:00Z'),
  },
];

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db('nordelta-build').collection('members');
    for (const m of MEMBERS) {
      const exists = await col.findOne({ name: m.name });
      if (exists) {
        await col.updateOne({ name: m.name }, { $set: m });
        console.log(`✓ Updated: ${m.name}`);
      } else {
        await col.insertOne(m);
        console.log(`✓ Inserted: ${m.name}`);
      }
    }
    console.log('\nSeed complete.');
  } finally {
    await client.close();
  }
}

seed().catch(err => { console.error(err); process.exit(1); });
