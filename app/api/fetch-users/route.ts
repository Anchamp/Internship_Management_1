import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');

    if (!adminUsername) {
      return NextResponse.json({
        error: 'Username parameter is required',
        status: 400 
      });
    }

    await dbConnect();

    const adminUser: (typeof User) extends { prototype: infer U } ? U & { organizationId?: string; organizationName?: string } : any = await User.findOne({ username: adminUsername, role: 'admin' }).lean();
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }
    
    const organizationName = adminUser.organizationName;
    if (!organizationName) {
      return NextResponse.json({ error: 'Admin has no organization Name' }, { status: 400 });
    }
    // Fetching mentors and panelists from the database
    const employees = await User.find({
      organizationName: organizationName,
      role: { $in: ['admin', 'mentor', 'panelist'] }
    }).select("-password").lean();

    // Grouping employees by role
    const mentors = employees.filter(emp => emp.role === 'mentor');
    const panelists = employees.filter(emp => emp.role === 'panelist');
    const admins = employees.filter(emp => emp.role === 'admin');

    return NextResponse.json({
      success: true,
      admins,
      mentors,
      panelists,
      organizationName
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

