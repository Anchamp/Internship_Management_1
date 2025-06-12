import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Team from '@/models/Team';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();
    
    // Parse request body
    const body = await request.json();
    const { username, teamName, mentors, interns, panelists, description, organizationName, organizationId } = body;
    
    // Validate input
    if (!username || !teamName || !mentors || !interns || !panelists || !description || !organizationName || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate if the user sending request is an admin
    const adminUser: (typeof User) extends { prototype: infer U } ? U & { organizationId?: string; organizationName?: string } : any = await User.findOne({ username: username, role: 'admin' }).lean();

    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create teams' },
        { status: 403 }
      );
    }

    const role = adminUser.role;
    
    // Additional validation for admin role - require organizationName
    if (!organizationName) {
      return NextResponse.json(
        { error: 'Organization name is required for admin accounts' },
        { status: 400 }
      );
    }
    
    // Additional validation for mentor/panelist roles - require organizationId
    if (['mentor', 'panelist', 'intern'].includes(role) && !organizationId) {
      return NextResponse.json(
        { error: 'Organization selection is required for mentor/panelist/intern accounts' },
        { status: 400 }
      );
    }
    // Prepare Team Data 
    const teamData: any = {
      teamName,
      mentors,
      interns,
      panelists,
      description,
      organizationName: organizationName,
      organizationId: organizationId,
      status: 'active'
    };
    
    // Create new user
    const newTeam = new Team(teamData);
    await newTeam.save();
    
    // Return success response (without password)
    const { team } = newTeam.toObject();

    for (const mentor of mentors) {
      const user = await User.findById(mentor);
      if (user) {
        user.teams.push(newTeam._id);
        await user.save();
      } else {
        console.warn(`Mentor with ID ${mentor} not found`);
      }
    } 

    for (const intern of interns) {
      const user = await User.findById(intern);
      if (user) {
        user.teams.push(newTeam._id);
        await user.save();
      } else {
        console.warn(`Intern with ID ${intern} not found`);
      }
    }

    for (const panelist of panelists) {
      const user = await User.findById(panelist);
      if (user) {
        user.teams.push(newTeam._id);
        await user.save();
      } else {
        console.warn(`Panelist with ID ${panelist} not found`);
      }
    }
    
    return NextResponse.json({
      message: 'Team created successfully',
      team: team 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Team Creation Error:', error);
    return NextResponse.json(
      { error: 'Failed to create team', details: error.message },
      { status: 500 }
    );
  }
}  
