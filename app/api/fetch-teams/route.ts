import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';
import Intern from '@/models/Intern';

interface UsernameDoc {
  username: string;
  _id: unknown;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({
        error: 'Username parameter is required',
        status: 400
      });
    }

    await dbConnect();

    interface IUser {
      _id: unknown;
      username: string;
      organizationName?: string;
      role?: string;
      teams?: unknown[];
      __v?: number;
    }

    const user = await User.findOne({ username: username }).lean() as IUser | null;
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        status: 404
      })
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
      const teams = await Team.find({ organizationName: organizationName }).lean();
      for (let team of teams) {
        const mentorIds = team.mentors;
        const internIds = team.interns;
        const panelistIds = team.panelists;
        for (const mentorId of mentorIds) {
          const mentorUsername = await User.findById(mentorId, 'username').lean() as UsernameDoc | null;
          if (mentorUsername) {
            team.mentors.push(mentorUsername.username);
          }
        }

        for (const internId of internIds) {
          const internUsername = await Intern.findById(internId, 'username').lean() as UsernameDoc | null;
          if (internUsername) {
            team.interns.push(internUsername.username);
          }
        }

        for (const panelistId of panelistIds) {
          const panelistUsername = await User.findById(panelistId, 'username').lean() as UsernameDoc | null;
          if (panelistUsername) {
            team.panelists.push(panelistUsername.username);
          }
        }
      }

      return NextResponse.json({
        success: true,
        teams,
        organizationName
      });
    }

    if (userRole !== 'admin') {
      let teams: any[] = [];
      if (user.teams && user.teams.length > 0) {
        teams = await Team.find({ _id: { $in: user.teams } }).lean();
      }

      for (let team of teams) {
        const mentorIds = team.mentors;
        const internIds = team.interns;
        const panelistIds = team.panelists;

        team.mentors = []
        team.interns = []
        team.panelists = []

        for (const mentorId of mentorIds) {
          const mentorUsername = await User.findById(mentorId, 'username').lean() as UsernameDoc | null;
          if (mentorUsername) {
            team.mentors.push(mentorUsername.username);
          }
        }

        for (const internId of internIds) {
          const internUsername = await Intern.findById(internId, 'username').lean() as UsernameDoc | null;
          if (internUsername) {
            team.interns.push(internUsername.username);
          }
        }

        for (const panelistId of panelistIds) {
          const panelistUsername = await User.findById(panelistId, 'username').lean() as UsernameDoc | null;
          if (panelistUsername) {
            team.panelists.push(panelistUsername.username);
          }
        }
      }
      return NextResponse.json({
        success: true,
        teams,
        organizationName
      });
    }

  } catch (error: any) {
    console.error("Error fetching Teams:", error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Teams',
        details: error.message
      },
      { status: 500 }
    );
  }
}
