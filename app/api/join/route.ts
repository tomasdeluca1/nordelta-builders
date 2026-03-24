import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(n => n[0]?.toUpperCase() ?? '').join('');
}

const ROLE_TITLE: Record<string, string> = {
  'Founder/CEO':        'Founder',
  'Developer/Engineer': 'Dev',
  'Product/Design':     'Product',
  'Marketing/Growth':   'Growth',
  'Inversor':           'Inversor',
  'Otro':               'Builder',
};

const ROLE_TAGS: Record<string, string[]> = {
  'Founder/CEO':        ['Founder'],
  'Developer/Engineer': ['Dev'],
  'Product/Design':     ['Product'],
  'Marketing/Growth':   ['Growth'],
  'Inversor':           ['Inversor'],
  'Otro':               ['Builder'],
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { error: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const collection = client.db('nordelta-build').collection('members');

    const existing = await collection.findOne({ email: body.email });
    if (existing) {
      return NextResponse.json({ success: true, message: 'Already registered' }, { status: 200 });
    }

    const count = await collection.countDocuments();

    const newMember = {
      name: body.name,
      email: body.email,
      role: body.role,
      initials: getInitials(body.name),
      jobTitle: ROLE_TITLE[body.role] ?? body.role,
      company: body.company?.trim() || undefined,
      companyUrl: body.companyUrl?.trim() || undefined,
      tags: Array.isArray(body.tags) && body.tags.length > 0
        ? body.tags
        : ROLE_TAGS[body.role] ?? ['Builder'],
      colorIndex: count % 8,
      createdAt: new Date(),
      status: 'active',
    };

    const result = await collection.insertOne(newMember);

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error inserting member:', error);
    return NextResponse.json(
      { error: 'Internal server error while saving to database' },
      { status: 500 }
    );
  }
}
