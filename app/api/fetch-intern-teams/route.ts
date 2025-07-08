import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';
import Intern from '@/models/Intern';

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

    // Find the intern user ONLY
    const internUser = await Intern.findOne({ username: username }).lean();
    if (!internUser) {
      return NextResponse.json({
        error: 'Intern not found',
        status: 404
      });
    }

    const organizationName = (internUser as any).organizationName;

    if (!organizationName) {
      return NextResponse.json({
        error: 'Intern has no organization assigned',
        status: 400
      });
    }

    // Fetch only teams that the intern is part of
    let teams: any[] = [];
    if ((internUser as any).teams && (internUser as any).teams.length > 0) {
      teams = await Team.find({ _id: { $in: (internUser as any).teams } }).lean();
    }

    if (teams.length === 0) {
      return NextResponse.json({
        success: true,
        teams: [],
        organizationName,
        totalTeams: 0,
        userRole: 'intern'
      });
    }

    // ==========================================
    // OPTIMIZED APPROACH: BATCH QUERIES
    // ==========================================

    // Step 1: Collect ALL unique IDs from ALL teams
    const allMentorIds = new Set<string>();
    const allInternIds = new Set<string>();
    const allPanelistIds = new Set<string>();

    for (const team of teams) {
      // Collect mentor IDs
      if (team.mentors && Array.isArray(team.mentors)) {
        team.mentors.forEach((id: any) => allMentorIds.add(id.toString()));
      }
      
      // Collect intern IDs
      if (team.interns && Array.isArray(team.interns)) {
        team.interns.forEach((id: any) => allInternIds.add(id.toString()));
      }
      
      // Collect panelist IDs
      if (team.panelists && Array.isArray(team.panelists)) {
        team.panelists.forEach((id: any) => allPanelistIds.add(id.toString()));
      }
    }

    // Step 2: Batch fetch ALL usernames in just 3 queries (no type casting)
    const mentorQuery = allMentorIds.size > 0 
      ? User.find({ _id: { $in: Array.from(allMentorIds) } }, 'username').lean()
      : Promise.resolve([]);
      
    const internQuery = allInternIds.size > 0 
      ? Intern.find({ _id: { $in: Array.from(allInternIds) } }, 'username').lean()
      : Promise.resolve([]);
      
    const panelistQuery = allPanelistIds.size > 0 
      ? User.find({ _id: { $in: Array.from(allPanelistIds) } }, 'username').lean()
      : Promise.resolve([]);

    const [mentorUsers, internUsers, panelistUsers] = await Promise.all([
      mentorQuery,
      internQuery,
      panelistQuery
    ]);

    // Step 3: Create lookup maps for O(1) access
    const mentorMap = new Map<string, string>();
    const internMap = new Map<string, string>();
    const panelistMap = new Map<string, string>();

    // Safely populate maps
    if (Array.isArray(mentorUsers)) {
      mentorUsers.forEach((user: any) => {
        if (user && user._id && user.username) {
          mentorMap.set(user._id.toString(), user.username);
        }
      });
    }

    if (Array.isArray(internUsers)) {
      internUsers.forEach((user: any) => {
        if (user && user._id && user.username) {
          internMap.set(user._id.toString(), user.username);
        }
      });
    }

    if (Array.isArray(panelistUsers)) {
      panelistUsers.forEach((user: any) => {
        if (user && user._id && user.username) {
          panelistMap.set(user._id.toString(), user.username);
        }
      });
    }

    // Step 4: Convert IDs to usernames using lookup maps (super fast)
    for (const team of teams) {
      const mentorIds = team.mentors || [];
      const internIds = team.interns || [];
      const panelistIds = team.panelists || [];

      // Convert mentor IDs to usernames
      team.mentors = mentorIds
        .map((id: any) => mentorMap.get(id.toString()))
        .filter((username: string | undefined) => username !== undefined);

      // Convert intern IDs to usernames
      team.interns = internIds
        .map((id: any) => internMap.get(id.toString()))
        .filter((username: string | undefined) => username !== undefined);

      // Convert panelist IDs to usernames
      team.panelists = panelistIds
        .map((id: any) => panelistMap.get(id.toString()))
        .filter((username: string | undefined) => username !== undefined);
    }

    return NextResponse.json({
      success: true,
      teams,
      organizationName,
      totalTeams: teams.length,
      userRole: 'intern'
    });

  } catch (error: any) {
    console.error("Error fetching intern teams:", error);
    return NextResponse.json(
      {
        error: 'Failed to fetch teams',
        details: error.message
      },
      { status: 500 }
    );
  }
}