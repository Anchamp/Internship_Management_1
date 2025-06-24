import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');
    
    if (!adminUsername) {
      return NextResponse.json({ error: 'Admin username is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Get the admin user to find their organizationId
    const adminUser = await User.findOne({ username: adminUsername, role: 'admin' }).lean() as ({
      organizationId?: string;
      organizationName?: string;
      [key: string]: any;
    } | null);
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    const organizationId = adminUser.organizationId;
    
    if (!organizationId) {
      return NextResponse.json({ error: 'Admin has no organization ID' }, { status: 400 });
    }
    
    // Find verified users with matching organizationId
    const verifiedUsers = await User.find({
      organizationId: organizationId,
      verificationStatus: 'verified',
    }).select('-password').lean();

    const interns = await Intern.find({
      organizationId: organizationId,
      verificationStatus: 'verified',
    }).select('-password').lean();
    
    // Sort users by role and name for better organization
    const sortedUsers = [...verifiedUsers, ...interns].sort((a, b) => {
      // First sort by role
      const roleOrder = { admin: 1, mentor: 2, panelist: 3, intern: 4 };
      const roleA = roleOrder[a.role as keyof typeof roleOrder] || 999;
      const roleB = roleOrder[b.role as keyof typeof roleOrder] || 999;
      
      const roleDiff = roleA - roleB;
      
      // If same role, sort by name
      if (roleDiff === 0) {
        const nameA = (a.fullName || a.username || '').toLowerCase();
        const nameB = (b.fullName || b.username || '').toLowerCase();
        return nameA.localeCompare(nameB);
      }
      
      return roleDiff;
    });
    
    return NextResponse.json({
      success: true,
      users: sortedUsers,
      organizationId,
      organizationName: adminUser.organizationName,
      count: sortedUsers.length
    });
  } catch (error: any) {
    console.error('Error fetching verified users:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch verified users', 
      details: error.message 
    }, { status: 500 });
  }
}
