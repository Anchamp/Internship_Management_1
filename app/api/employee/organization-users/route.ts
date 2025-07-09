import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const orgId = searchParams.get('organizationId');
    
    if (!username && !orgId) {
      return NextResponse.json({
        error: 'Either username or organizationId parameter is required',
        status: 400 
      });
    }

    await dbConnect();
    
    let organizationName;
    
    // First determine the organization - either by organizationId or username
    if (orgId) {
      // If organization ID is directly provided, find a user with this organizationId to get the name
      const anyUserWithOrgId = await User.findOne({ organizationId: orgId }).lean();
      if (anyUserWithOrgId) {
        organizationName = anyUserWithOrgId.organizationName;
      } else {
        return NextResponse.json({ error: 'No organization found with the provided ID' }, { status: 404 });
      }
    } else {
      // If only username is provided, find the user to get their organization
      const user = await User.findOne({ username }).lean();
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      organizationName = user.organizationName;
      if (!organizationName || organizationName === "none") {
        return NextResponse.json({ error: 'User is not assigned to any organization' }, { status: 400 });
      }
    }

    // Now fetch all users from this organization
    const users = await User.find({
      organizationName: organizationName,
    }).select("-password").lean();

    const interns = await Intern.find({
      organizationName: organizationName,
    }).select("-password").lean();

    // Group users by role
    const employees = users.filter(user => user.role === 'employee');
    const admins = users.filter(user => user.role === 'admin');

    return NextResponse.json({
      success: true,
      users: [...admins, ...employees, ...interns], // Combined list for backward compatibility
      admins,
      employees,
      interns,
      organizationName,
      count: admins.length + employees.length + interns.length
    });
    
  } catch (error: any) {
    console.error("Error fetching organization users:", error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch organization users',
        details: error.message
      },
      { status: 500 }
    );
  }
}

