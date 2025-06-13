import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import Team from '@/models/Team';
import User from '@/models/User';

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

    const user = await User.findOne({ username: username }).lean();
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
      return NextResponse.json({
        success: true,
        teams,
        organizationName
      });
    }

    if (userRole !== 'admin') {
      let teams = []
      if (user.teams && user.teams.length > 0) {
        teams = await Team.find({ _id: { $in: user.teams } }).lean();
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
