import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Find all admin users with organization names
    const admins = await User.find({ 
      role: 'admin',
      organizationName: { $ne: 'none' } // Exclude admins without organizations
    }).select('organizationName');
    
    // Extract unique organization names
    const organizations = admins.map(admin => ({
      id: admin._id.toString(),
      name: admin.organizationName
    }));
    
    return NextResponse.json({ organizations });
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
