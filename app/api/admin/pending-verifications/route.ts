import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');
    
    if (!adminUsername) {
      return NextResponse.json({ error: 'Admin username is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    console.log(`Fetching pending verifications for admin: ${adminUsername}`);
    
    // Get the admin user to find their organizationId
    const adminUser: (typeof User) extends { prototype: infer U } ? U & { organizationId?: string; organizationName?: string } : any = await User.findOne({ username: adminUsername, role: 'admin' }).lean();
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    const organizationId = adminUser.organizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Admin has no organization ID' }, { status: 400 });
    }
    
    console.log(`Searching for users with organizationId: ${organizationId} and verificationStatus: pending`);
    
    // Find users with matching organizationId, pending verification, and have submitted their profile
    const pendingVerifications = await User.find({
      organizationId: organizationId,
      verificationStatus: 'pending', // Specifically filter for 'pending' status
      profileSubmissionCount: { $gt: 0 }, // Only users who have submitted their profile
      role: 'employee'
    }).select('-password').lean();
    
    console.log(`Found ${pendingVerifications.length} pending verification requests`);
    
    // Group by role
    const employees = pendingVerifications.filter(user => user.role === 'employee');
    
    return NextResponse.json({
      success: true,
      employees,
      organizationId,
      organizationName: adminUser.organizationName
    });
  } catch (error: any) {
    console.error('Error fetching pending verifications:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch pending verifications', 
      details: error.message 
    }, { status: 500 });
  }
}
