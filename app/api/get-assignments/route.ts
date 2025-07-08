import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Assignment from '@/models/Assignment';
import Team from '@/models/Team';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const teamName = searchParams.get('teamName');

    // Parse Username
    if (!username) {
      return NextResponse.json({
        error: 'Username parameter is required',
        status: 400,
      });
    }

    // Connect to MongoDB
    await dbConnect();

    // Validate User
    let user;
    const employeeUser = await User.findOne({username}).select("role organizationName organizationId").lean();
    const internUser = await Intern.findOne({username}).select("role organizationName").lean();

    if (employeeUser) {
      user = employeeUser;
    } else if (internUser) {
      user = internUser;
    }

    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        status: 404,
      });
    }
    
    // Validate Team
    const team = await Team.findOne({teamName, organizationName: user.organizationName}).lean();
    if (!team) {
      return NextResponse.json({
        error: 'Team not found',
        status: 404,
      });
    }

    if (user.role === 'admin') {
      return NextResponse.json({
        success: true,
        assignments: team.assignments,
      });
    }

    if (user.role === 'employee') {
      const allEmployees = [...team.mentors, ...team.panelists];
      if (!allEmployees.includes(user._id.toString())) {
        return NextResponse.json({
          error: "User not authorized",
          status: 401,
        });
      }
      return NextResponse.json({
        success: true,
        assignments: team.assignments,
      });
    }

    if (user.role === 'intern') {
      if (!team.interns.includes(user._id.toString())) {
        return NextResponse.json({
          error: "User not authorized",
          status: 401,
        });
      }
      return NextResponse.json({
        success: true,
        assignments: team.assignments,
      });
    }
  } catch (error: any) {
    console.log("Error fetching Assignments:", error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500
    });
  }
}

