import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import Intern from '@/models/Intern';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'ID parameter is required',
        status: 400
      });
    }

    await dbConnect();

    const user = await User.findById(id, {username: 1}).lean() as { username?: string } | null;
    const intern = await Intern.findById(id, {username: 1}).lean() as { username?: string } | null;

    if (!user && !intern) {
      return NextResponse.json({
        error: 'User not found',
        status: 404
      });
    }

    if (user && user.username) {
      return NextResponse.json({
        success: true,
        username: user.username
      });
    } else if (intern && intern.username) {
      return NextResponse.json({
        success: true,
        username: intern.username
      });
    } else {
      return NextResponse.json({
        error: 'Username not found',
        status: 404
      });
    }

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500
    });
  }
}
