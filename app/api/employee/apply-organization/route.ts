import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { username, organizationId } = await request.json();

    if (!username || !organizationId) {
      return NextResponse.json(
        { error: "Username and organization ID are required" },
        { status: 400 }
      );
    }

    // Find the employee
    const employee = await User.findOne({ username, role: "employee" });
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Find the organization admin to verify the organizationId
    const admin = await User.findOne({ 
      organizationId: organizationId,
      role: "admin" 
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 }
      );
    }

    // Update the employee with ONLY the organizationId, keeping organizationName as "none"
    const updatedEmployee = await User.findByIdAndUpdate(
      employee._id,
      {
        $set: {
          organizationId: organizationId, // Set to match the admin's organizationId
          organizationName: "none", // Keep as "none" as requested
          profileSubmissionCount: 1,
          verificationStatus: "pending"
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      employee: {
        username: updatedEmployee.username,
        organizationId: updatedEmployee.organizationId,
        organizationName: updatedEmployee.organizationName,
        profileSubmissionCount: updatedEmployee.profileSubmissionCount
      }
    });
  } catch (error: any) {
    console.error("Error applying for organization:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
