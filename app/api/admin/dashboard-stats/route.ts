import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Team from "@/models/Team";
import Feedback from "@/models/Feedback";

export async function GET(request: Request) {
  try {
    // Get admin information from request
    const { searchParams } = new URL(request.url);
    const adminUsername = searchParams.get('username');
    
    if (!adminUsername) {
      return NextResponse.json({ error: 'Admin username is required' }, { status: 400 });
    }
    
    await dbConnect();
    
    // Get the admin user to verify their role and organization
    // Add type assertion to handle potential array return
    const adminUser = await User.findOne({ username: adminUsername, role: 'admin' }).lean() as {
      organizationId?: string;
      organizationName?: string;
      [key: string]: any;
    } | null;
    
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin not found or unauthorized' }, { status: 403 });
    }
    
    const organizationId = adminUser.organizationId;
    const organizationName = adminUser.organizationName;
    
    if (!organizationId || !organizationName) {
      return NextResponse.json({ error: 'Admin has no organization information' }, { status: 400 });
    }

    console.log(`Fetching stats for organization: ${organizationName}`);
    
    // Modified: Only count VERIFIED users with matching organization name
    const totalUsers = await User.countDocuments({ 
      organizationName, 
      verificationStatus: 'verified' // Only count verified users
    });
    
    const internsCount = await User.countDocuments({ 
      organizationName, 
      role: "intern",
      verificationStatus: 'verified' // Only count verified users
    });
    
    const employeeCount = await User.countDocuments({ 
      organizationName, 
      role: "employee",
      verificationStatus: 'verified' // Only count verified users
    });
    
    const adminCount = await User.countDocuments({ 
      organizationName, 
      role: "admin",
      verificationStatus: 'verified' // Only count verified users
    });
    
    // Fix for the ObjectId casting error - use organization name instead
    let teamsCount = 0;
    try {
      teamsCount = await Team.countDocuments({ organizationName });
    } catch (err) {
      console.error("Error fetching teams count:", err);
    }

    // Get pending approvals
    const pendingApprovals = await User.countDocuments({
      organizationName,
      verificationStatus: 'pending'
    });

    // Generate chart data for user growth over the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Get the last 6 months
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date);
    }

    const chartData = {
      labels: months.map(m => m.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
      datasets: [
        {
          name: "Interns",
          values: new Array(6).fill(0)
        },
        {
          name: "Employees",
          values: new Array(6).fill(0)
        },
        {
          name: "Total",
          values: new Array(6).fill(0)
        }
      ]
    };

    // Create dummy data structure for fallback
    const dummyData = {
      totalUsers,
      internsCount,
      employeeCount,
      adminCount
    };

    try {
      // Update the user growth pipeline to only include verified users
      const userGrowthPipeline = [
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
            organizationName: organizationName,
            verificationStatus: 'verified' // Only include verified users
          }
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" },
              role: "$role"
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { "_id.year": 1 as const, "_id.month": 1 as const }
        }
      ];

      const userGrowthResults = await User.aggregate(userGrowthPipeline);

      // Fill in the actual data
      userGrowthResults.forEach(result => {
        const monthIndex = months.findIndex(m => 
          m.getMonth() === result._id.month - 1 && 
          m.getFullYear() === result._id.year
        );
        
        if (monthIndex >= 0) {
          // Update specific role counts
          if (result._id.role === "intern") {
            chartData.datasets[0].values[monthIndex] += result.count;
          } else if (result._id.role === "employee") {
            chartData.datasets[1].values[monthIndex] += result.count;
          }
          
          // Update total count
          chartData.datasets[2].values[monthIndex] += result.count;
        }
      });
    } catch (err) {
      console.error("Error generating chart data:", err);
      // We'll continue with the empty chartData initialized above
    }

    // Update top performers query to use organization name
    let topPerformers = [];
    try {
      topPerformers = await Feedback.find({ organizationName })
        .sort({ rating: -1 })
        .limit(3)
        .populate('userId', 'name role')
        .lean();
    } catch (err) {
      console.error("Error fetching top performers:", err);
    }

    return NextResponse.json({
      success: true,
      totalUsers: dummyData.totalUsers,
      internsCount: dummyData.internsCount,
      employeeCount: dummyData.employeeCount, 
      adminCount: dummyData.adminCount,
      teamsCount,
      pendingApprovals,
      chartData,
      topPerformers: topPerformers || [],
      organizationId,
      organizationName
    });
  } catch (error: any) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics", details: error.message },
      { status: 500 }
    );
  }
}
