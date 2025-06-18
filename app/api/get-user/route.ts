import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

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

    const user = await User.findById(id, {username: 1}).lean();
    if (!user) {
      return NextResponse.json({
        error: 'User not found',
        status: 404
      });
    }

    return NextResponse.json({
      success: true,
      username: user.username
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      status: 500
    });
  }
}
