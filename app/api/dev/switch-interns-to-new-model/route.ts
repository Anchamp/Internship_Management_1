// This file can be deleted later

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const allInterns = await User.find({role: 'intern'}).lean();

    const existingIds = await Intern.find().distinct('_id');
    const newInterns = existingIds.filter((intern) => {
      return !existingIds.some((id) => id.toString() === intern._id.toString());
    });

    if (newInterns.length > 0) {
      await Intern.insertMany(
        newInterns.map((intern) => ({
          ...intern,
          _id: intern._id, 
        })),
        { ordered: false }
      );
    } else {
      console.log('No new interns to migrate.');
    }

    const deletingResult = await User.deleteMany({ role: 'intern'}).lean();
   
    return NextResponse.json({
      message: 'Shifted all the interns from User Model to Intern Model',
      newInterns: newInterns,
      deletingResult: deletingResult,
    });
  } catch (error: any) {
    console.error("Error performing transition: ", error);
    return NextResponse.json(
      {
        error: 'Failed to perform Transition',
        details: error.message
      },
      { status: 500 }
    );
  }
}
