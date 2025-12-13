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

    // Validate User - Add type assertions
    let user: {
      role?: string;
      organizationName?: string;
      organizationId?: string;
      _id?: any;
      [key: string]: any;
    } | null = null;
    
    const employeeUser = await User.findOne({username}).select("role organizationName organizationId").lean() as {
      role?: string;
      organizationName?: string;
      organizationId?: string;
      _id?: any;
      [key: string]: any;
    } | null;
    
    const internUser = await Intern.findOne({username}).select("role organizationName").lean() as {
      role?: string;
      organizationName?: string;
      _id?: any;
      [key: string]: any;
    } | null;

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
    const team = await Team.findOne({teamName, organizationName: user.organizationName}).lean() as {
      assignments?: any[];
      mentors?: any[];
      interns?: any[];
      panelists?: any[];
      [key: string]: any;
    } | null;
    
    if (!team) {
      return NextResponse.json({
        error: 'Team not found',
        status: 404,
      });
    }

    // get assignment for each id in team.assignments
    let assigments = []
    if (team.assignments && Array.isArray(team.assignments)) {
      for (const assignmentId of team.assignments) {
        const assignment = await Assignment.findById(assignmentId).lean();
        if (assignment) {
          assigments.push(assignment);
        }
      }
    }

    if (user.role === 'admin') {
      return NextResponse.json({
        success: true,
        assignments: assigments,
      });
    }

    if (user.role === 'employee') {
      const allEmployees = [...(team.mentors || []), ...(team.panelists || [])];
      if (!allEmployees.includes(user._id.toString())) {
        return NextResponse.json({
          error: "User not authorized",
          status: 401,
        });
      }
      return NextResponse.json({
        success: true,
        assignments: assigments,
      });
    }

    if (user.role === 'intern') {
      if (!(team.interns || []).includes(user._id.toString())) {
        return NextResponse.json({
          error: "User not authorized",
          status: 401,
        });
      }
      return NextResponse.json({
        success: true,
        assignments: assigments,
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
