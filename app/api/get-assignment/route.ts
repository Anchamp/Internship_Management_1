import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Assignment from '@/models/Assignment';
import Team from '@/models/Team';

// Define interfaces for type safety
interface UserDocument {
  _id: string;
  role: string;
  organizationName: string;
  organizationId?: string;
}

interface InternDocument {
  _id: string;
  role: string;
  organizationName: string;
}

interface TeamDocument {
  _id: string;
  teamName: string;
  organizationName: string;
  assignments?: string[];
  mentors?: string[];
  panelists?: string[];
  interns?: string[];
}

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
    let user: UserDocument | InternDocument | null = null;
    const employeeUser = await User.findOne({username}).select("role organizationName organizationId").lean() as UserDocument | null;
    const internUser = await Intern.findOne({username}).select("role organizationName").lean() as InternDocument | null;

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

    if (!user.organizationName) {
      return NextResponse.json({
        error: 'User organization data incomplete',
        status: 400,
      });
    }
    
    // Validate Team
    const team = await Team.findOne({teamName, organizationName: user.organizationName}).lean() as TeamDocument | null;
    if (!team) {
      return NextResponse.json({
        error: 'Team not found',
        status: 404,
      });
    }

    // Get assignment for each id in team.assignments
    let assigments = [];
    
    // Check if team.assignments exists and is an array
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
      const allEmployees = [
        ...(team.mentors || []), 
        ...(team.panelists || [])
      ];
      
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
      const teamInterns = team.interns || [];
      
      if (!teamInterns.includes(user._id.toString())) {
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

    // If role doesn't match any expected role
    return NextResponse.json({
      error: "Invalid user role",
      status: 400,
    });

  } catch (error: any) {
    console.log("Error fetching Assignments:", error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500
    });
  }
}
