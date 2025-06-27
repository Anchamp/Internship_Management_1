import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Internship from '@/models/Internship';

export async function GET(request: Request) {
  try {
    await dbConnect();
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const mode = searchParams.get('mode');
    const sortOrder = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'published';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    
    // Get today's date at midnight UTC for consistent comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    
    // Build query for public internship listings
    let query: any = {
      status: status,
      applicationDeadline: { $gte: today } // Only show internships with future deadlines
    };
    
    // Add search filter (search in title, organization, and department)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { organizationName: searchRegex },
        { department: searchRegex }
      ];
    }
    
    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add mode filter
    if (mode && mode !== 'all') {
      query.mode = mode;
    }
    
    // Determine sort options
    let sortOptions: any = { postingDate: -1 }; // Default: newest first
    if (sortOrder === 'oldest') {
      sortOptions = { postingDate: 1 };
    } else if (sortOrder === 'deadline') {
      sortOptions = { applicationDeadline: 1 };
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    console.log('Fetching internships with query:', JSON.stringify(query));
    
    // Fetch internships with pagination
    const internships = await Internship.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .select('-applications') // Don't expose application details publicly
      .lean();
    
    // Get total count for pagination
    const total = await Internship.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      success: true,
      internships,
      pagination: {
        total,
        page,
        limit,
        pages: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching public internships:', error);
    return NextResponse.json({
      error: 'Failed to fetch internships',
      details: error.message
    }, { status: 500 });
  }
}