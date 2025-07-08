import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Intern from "@/models/Intern";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, adminUsername, isIntern, isEmployee, resetFields } = body;

    if (!userId || !adminUsername) {
      return NextResponse.json(
        { error: "User ID and admin username are required" },
        { status: 400 }
      );
    }

    // Find the admin to verify authority (using User model)
    const admin = await User.findOne({ username: adminUsername, role: "admin" });
    if (!admin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin not found." },
        { status: 401 }
      );
    }

    if (isIntern && resetFields) {
      // For interns: Reset fields to default values but keep them in the system
      const updatedUser = await Intern.findByIdAndUpdate(
        userId,
        {
          $set: {
            organizationName: resetFields.organizationName || "none",
            organizationId: resetFields.organizationId || null,
            teams: resetFields.teams || [],
            weeklyReports: resetFields.weeklyReports || [],
            feedback: resetFields.feedback || [],
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Intern not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "User successfully removed from the organization",
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          organizationName: updatedUser.organizationName,
        },
      });
    } else if (isEmployee && resetFields) {
      // For employees: Reset fields to default values but keep them in the system
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            organizationName: resetFields.organizationName || "none",
            organizationId: resetFields.organizationId || "none",
            teams: resetFields.teams || [],
            profileSubmissionCount: resetFields.profileSubmissionCount || -1,
            verificationStatus: "pending", // Reset verification status to pending
          },
        },
        { new: true }
      );

      if (!updatedUser) {
        return NextResponse.json(
          { error: "Employee not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Employee successfully removed from the organization",
        user: {
          _id: updatedUser._id,
          username: updatedUser.username,
          organizationName: updatedUser.organizationName,
        },
      });
    } else {
      // For complete removal (not currently used but kept for future)
      const user = await User.findById(userId);
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }
      
      // Don't allow removing admins
      if (user.role === "admin") {
        return NextResponse.json(
          { error: "Cannot remove an admin" },
          { status: 403 }
        );
      }
      
      // Delete the user
      await User.findByIdAndDelete(userId);
      
      return NextResponse.json({
        success: true,
        message: "User removed successfully",
      });
    }
  } catch (error: any) {
    console.error("Error removing user:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
