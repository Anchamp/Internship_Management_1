import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Assingment from '@/models/Assignment';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');

    if (!assignmentId) {
      return NextResponse.json({
        error: 'Assignment ID parameter is required',
        status: 400,
      })
    }

    await dbConnect();

    const assignment = await Assingment.findById(assignmentId).lean();
    if (!assignment) {
      return NextResponse.json({
        error: 'Assignment not found',
        status: 404,
      });
    }

    return NextResponse.json({
      assignment,
      status: 200,
    });
  } catch (error: any) {
    console.error('Error fetching assignment:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500,
    });
  }
}

