// This file can be deleted later

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    // Fetch all the users with the role of 'mentor'
    await dbConnect();

    // Change the role of all the mentors to 'employee'
    const updatedMentors = await User.updateMany(
      { role: 'mentor' },
      { $set: { role: 'employee' } }
    );

    const updatedPanelists = await User.updateMany(
      { role: 'panelist' },
      { $set: { role: 'employee' } }
    );

    return NextResponse.json({
      message: 'Mentors and Panelists have been updated to Employees',
      updatedMentors: updatedMentors,
      updatedPanelists: updatedPanelists,
    })
  } catch (error: any) {
    console.error("Error updating roles:", error);
    return NextResponse.json(
      { 
        error: 'Failed to update roles',
        details: error.message
      },
      { status: 500 }
    );
  }
}
