import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET() {
  try {
    await dbConnect();
    
    // Find admin users who have created organizations
    const adminUsers = await User.find({ 
      role: 'admin',
      organizationId: { $exists: true, $ne: null }
    }).select('organizationName organizationId').lean();
    
    // Transform the data for the frontend, using the correct organizationId
    const organizations = adminUsers.map(user => ({
      id: user.organizationId, // Use the formatted organizationId instead of MongoDB _id
      name: user.organizationName || 'Unnamed Organization'
    }));
    
    return NextResponse.json({
      success: true,
      organizations
    });
    
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch organizations',
        details: error.message
      },
      { status: 500 }
    );
  }
}
