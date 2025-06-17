import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // Await the params Promise
    const resolvedParams = await params;
    const internshipId = resolvedParams.id;
    
    const internship = await Internship.findById(internshipId)
      .select('-applications'); // Don't expose application details
    
    if (!internship) {
      return NextResponse.json({
        error: 'Internship not found'
      }, { status: 404 });
    }
    
    return NextResponse.json(internship);
    
  } catch (error: any) {
    console.error('Error fetching internship:', error);
    return NextResponse.json({
      error: 'Failed to fetch internship',
      details: error.message
    }, { status: 500 });
  }
}