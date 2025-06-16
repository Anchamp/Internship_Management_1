import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get unique categories from internships
    const uniqueCategories = await Internship.distinct('category');
    
    return NextResponse.json({
      success: true,
      categories: uniqueCategories
    });
    
  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to fetch categories',
      details: error.message
    }, { status: 500 });
  }
}
