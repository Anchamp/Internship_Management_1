import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');
    const requestedRole = searchParams.get('role');

    if (!adminUsername) {
      return NextResponse.json({
        error: 'Username parameter is required',
        status: 400 
      });
    }

    if (!requestedRole) {
      return NextResponse.json({
        error: 'Role parameter is required',
        status: 400 
      });
    }

    await dbConnect();

    const adminUser = await User.findOne({ username: adminUsername, role: 'admin' }).lean() as { organizationName?: string };
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const organizationName = adminUser.organizationName;
    if (!organizationName) {
      return NextResponse.json({ error: 'Admin has no organization Name' }, { status: 400 });
    }

    // Fetching all employees from the database
    let employees;
    if (requestedRole !== 'intern') {
      employees = await User.find({
        role: requestedRole,
        organizationName: organizationName,
      }).select("username -_id").lean();
    } else {
      employees = await Intern.find({
        role: requestedRole,
        organizationName: organizationName,
      }).select("username -_id").lean();
    }
    
    return NextResponse.json({
      users: employees,
    });
  } catch (error: any) {
    console.error("Error fetching Employees:", error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Employees',
        details: error.message
      },
      { status: 500 }
    );
  }
}
