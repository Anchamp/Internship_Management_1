import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userId, username } = body;

    if (!userId && !username) {
      return NextResponse.json(
        { error: "Either User ID or username is required" },
        { status: 400 }
      );
    }

    // Find the employee by ID or username
    let employee;
    if (userId) {
      employee = await User.findById(userId);
    } else if (username) {
      employee = await User.findOne({ username });
    }

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    if (employee.role !== "employee") {
      return NextResponse.json(
        { error: "Only employees can use this endpoint" },
        { status: 403 }
      );
    }

    // Store the organization name for the response
    const previousOrganization = employee.organizationName;

    // Reset organization fields
    employee.organizationName = "none";
    employee.organizationId = "none";
    employee.teams = [];
    employee.profileSubmissionCount = -1;
    employee.verificationStatus = "pending";

    // Save the updated employee
    await employee.save();

    return NextResponse.json({
      success: true,
      message: `Successfully left organization: ${previousOrganization}`,
      user: {
        username: employee.username,
        organizationName: employee.organizationName,
      },
    });
  } catch (error: any) {
    console.error("Error leaving organization:", error);
    return NextResponse.json(
      { error: error.message || "Failed to leave organization" },
      { status: 500 }
    );
  }
}
