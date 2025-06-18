import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const teamName = searchParams.get('teamName');

    if (!username) {
      return NextResponse.json({
        error: 'Username parameter is required',
        status: 400
      });
    }

    await dbConnect();

    const user = await User.findOne({ username: username }).lean();
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        status: 404
      });
    }

    const organizationName = user.organizationName;
    const userRole = user.role;

    if (!organizationName) {
      return NextResponse.json({
        error: 'User has no organization Name',
        status: 400
      });
    }

    if (!userRole) {
      return NextResponse.json({
        error: 'User has no role',
        status: 400
      });
    }

    if (userRole === 'admin') {
      const team = await Team.findOne({teamName: teamName, organizationName: organizationName }).lean();

      const mentorIds = team.mentors;
      const internIds = team.interns;
      const panelistIds = team.panelists;

      team.mentors = [];
      team.interns = [];
      team.panelists = [];

      for (const mentorId of mentorIds) {
        const mentor = await User.findById(mentorId).select('username').lean();
        if (mentor) {
          team.mentors.push(mentor.username);
        }
      }

      for (const internId of internIds) {
        const intern = await User.findById(internId).select('username').lean();
        if (intern) {
          team.interns.push(intern.username);
        }
      }

      for (const panelistId of panelistIds) {
        const panelist = await User.findById(panelistId).select('username').lean();
        if (panelist) {
          team.panelists.push(panelist.username);
        }
      }

      return NextResponse.json({
        success: true,
        team,
        organizationName
      });
    } else {
      const team = await Team.findOne({ teamName: teamName, organizationName: organizationName }).lean();
      const allUsers = [...team.mentors, ...team.interns, ...team.panelists];
      const existingUser = await User.findOne({ username: username, organizationName: organizationName }).lean();

      const mentorIds = team.mentors;
      const internIds = team.interns;
      const panelistIds = team.panelists;
     
      team.mentors = [];
      team.interns = [];
      team.panelists = [];

      for (const mentorId of mentorIds) {
        const mentor = await User.findById(mentorId).select('username').lean();
        if (mentor) {
          team.mentors.push(mentor.username);
        }
      }

      for (const internId of internIds) {
        const intern = await User.findById(internId).select('username').lean();
        if (intern) {
          team.interns.push(intern.username);
        }
      }

      for (const panelistId of panelistIds) {
        const panelist = await User.findById(panelistId).select('username').lean();
        if (panelist) {
          team.panelists.push(panelist.username);
        }
      }

      if (allUsers.includes(existingUser._id.toString())) {
        return NextResponse.json({
          success: true,
          team,
          organizationName
        });
      } else {
        return NextResponse.json({
          error: 'User does not have access to this team',
          status: 403
        });
      }
    }

  } catch (error: any) {
    console.error("Error fetching Team:", error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500
    });
  }
}
