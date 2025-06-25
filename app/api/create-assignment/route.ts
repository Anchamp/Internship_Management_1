import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';
import Team from '@/models/Team';
import Assignment from '@/models/Assignment';

export async function POST(request: Request) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Parse request body
    const body = await request.json();
    const {assignmentTeamName, assignmentName, assignmentFrom, description, organizationName, organizationId, assignedTo, deadline, status, mentorFeedback} = body;

  
    // Validate input
    if (!assignmentTeamName || !assignmentName || !assignmentFrom || !description || !organizationName || !organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate if user exists
    const user = await User.findOne({ username: assignmentFrom }).select("role organizationName organizationId").lean();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 },
      );
    }

    // Validate if the user is either admin or mentor
    if (user.role !== 'admin' && user.role !== 'employee') {
      return NextResponse.json(
        { error: 'User not authorized to create an assignment'},
        { status: 403 },
      );
    }

    // validate if the user belongs to the organization
    if (user.organizationName !== organizationName || user.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'User not a part of the organization' },
        { status: 403 },
      );
    }

    // Validate if the user belongs to the team
    const team = await Team.findOne({ teamName: assignmentTeamName, organizationName, organizationId });
    if (!team) {
      return NextResponse.json(
        { error: 'Requested Team name does not exist' },
        { status: 403 },
      );
    }

    const authorizedAdmin = await User.findOne({role: 'admin', organizationName: organizationName, organizationId: organizationId}).lean()
    if (!authorizedAdmin) {
      return NextResponse.json(
        { error: 'Issue with organization origins'},
        { status: 402 },
      );
    }

    const authorizedUsers = [...team.mentors, authorizedAdmin._id.toString()];
    if (!(authorizedUsers.includes(user._id.toString()))) {
      return NextResponse.json(
        { error: 'User is not a part of the team' },
        { status: 403 },
      );
    }

    // Check if assigned to Interns are available when given
    if (assignedTo) {
      for (const intern of assignedTo) {
        const internRequested = Intern.findOneById(intern).select("username").lean();
        if (!internRequested) {
          return NextResponse.json(
            { error: `Error Fetching Requested intern ${internRequested.username}`},
            { status: 404 },
          );
        }

        if (!(intern in team.interns)) {
          return NextResponse.json(
            { error: `Intern ${intern} is not a part of the team` },
            { status: 403 },
          );
        }
      }
    }

    // Validate Deadline if given
    let finalDeadline
    if (deadline) {
      finalDeadline = new Date(deadline)
      const now = new Date();
      if (now > finalDeadline) {
        return NextResponse.json(
          { error: "Invalid Deadline" },
          { status: 402 },
        );
      } 
    }

    // Validate status field
    let finalStatus = status;
    if (!finalStatus) {
      finalStatus = 'pending';
    }

    // Preparing Data
    const assignmentData = {
      assignmentTeamName,
      assignmentName,
      assignmentFrom,
      description,
      organizationName,
      organizationId,
      assignedTo,
      deadline: finalDeadline,
      status: finalStatus,
      mentorFeedback
    };

    // Creating the assignment
    const newAssigment = new Assignment(assignmentData);
    await newAssigment.save();

    return NextResponse.json({
      message: 'Assignment Created Successfully',
      assignment: newAssigment
    }, { status: 201 });
  } catch (error: any) {
    console.error("Assigment Creation Error: ", error);
    return NextResponse.json({ error: 'Failed to create Assigment', details: error.message}, { status: 500 });
  }
}

