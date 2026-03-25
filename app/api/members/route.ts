import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await getMongoClient();
    const docs = await client
      .db('nordelta-build')
      .collection('members')
      .find({ status: 'active' })
      .sort({ createdAt: 1 })
      .limit(11)
      .project({ email: 0 })
      .toArray();

    const members = docs.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
