"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Loader } from 'lucide-react';

interface TeamPageProps {
  teamId: string;
  teamName: string;
  mentors: string[]; 
  interns: string[];
  panelists: string[];
  description: string;
  status: string; 
  assignments: any[];
}

const Assignment = ({ assignment }: { assignment: any }) => {
  const [requestedAssignment, setRequestedAssignment] = useState<any>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#697282';
      case 'active':
        return '#00C851';
      case 'pending':
        return '#EEB001';
      case 'under review':
        return '#615EFE';
      default:
        return '#697282';
    }
  }
  
  useEffect(() => {
    const fetchAssignment = async () => {
      const getAssignment = async (assignmentId: string) => {
        const response = await fetch(`/api/get-assignment?assignmentId=${assignmentId}`);
        const data = await response.json();
        return data;
      };

      try {
        const response = await getAssignment(assignment);
        setRequestedAssignment(response);
      } catch (error) {
        console.error("Error fetching assignment:", error);
      }
    };
    fetchAssignment();
  }, [assignment]);

  console.log(requestedAssignment)

  if (!requestedAssignment) {
    return (
      <div className="w-full max-w-[400px] bg-white rounded-md shadow-lg m-2 p-2 overflow-hidden flex items-center justify-center h-[125px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500" />
      </div>
    );
  }

  function formatDate(isoString: string): string {
    const date = new Date(isoString);

    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    };

    const time = date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });

    const dateStr = date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    return `${time} · ${dateStr}`;
  }

  const renderingData = requestedAssignment.assignment 
  return (
    <div className="w-full max-w-[400px] bg-white rounded-md shadow-lg m-2 p-2 overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="font-bold max-w-[250px] overflow-hidden mr-1">{renderingData.assignmentName}</h2> 
        <p className="ml-1 max-w-[100px] overflow-hidden text-nowrap">{renderingData.assignmentFrom}</p>
      </div>
      <p className="my-2">{renderingData.description}</p>
      <div className="flex items-center justify-between px-2">
        <p>Deadline: {formatDate(renderingData.deadline)}</p>
        <div 
          style={{backgroundColor: getStatusColor(renderingData.status)}}
          className="text-white p-2 rounded-sm cursor-pointer"
        >
          {renderingData.status.charAt(0).toUpperCase() + renderingData.status.slice(1)}
        </div>
      </div>
    </div>
  )
}

const TeamPage = (props: TeamPageProps) => {
  const router = useRouter();
  const [role, setRole] = useState<string>("intern");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [username, setUsername] = useState<string>("");

  const { teamId, teamName, mentors, interns, panelists, description, status, assignments } = props;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/sign-in");
      return;
    }
    const user = JSON.parse(userData);
    setUsername(user.username);
    setRole(user.role)
  }, [router])

  useEffect(() => {
    const fetchAssignments = async () => {
      if (username) {
        const response = await fetch(`/api/get-assignments?username=${username}&teamName=${teamName}`)
        const data = await response.json();

        if (!data) {
          console.error("No assignments found");
          return;
        }
      }
    }

    fetchAssignments();
  }, [username, teamName])

  return (
    <div className="text-black m-0 p-0 rounded-md w-full">
      { role === "intern" && (
        <header className="p-2 flex items-center justify-between bg-white">
          <p className="font-bold text-xl">Mark Attendance</p>
          <div className="w-fit flex items-center justify-around gap-2">
            {attendanceStatus === "" && (
              <>
                <div 
                  className="cursor-pointer bg-green-700 p-2 rounded-sm text-white mx-2"
                  onClick={() => setAttendanceStatus("present")}
                >
                  Present
                </div>
                <div 
                  className="cursor-pointer bg-red-700 p-2 rounded-sm text-white mx-2"
                  onClick={() => setAttendanceStatus("leave")}
                >
                  Leave
                </div>
              </>
            )}
            {attendanceStatus === "present" && (
              <>
                <div 
                  className="cursor-pointer bg-green-700 p-2 rounded-sm text-white mx-2"
                  onClick={() => setAttendanceStatus("")}
                >
                  Marked Present
                </div>
              </>
            )}
            {attendanceStatus === "leave" && (
              <>
                <div 
                  className="cursor-pointer bg-red-700 p-2 rounded-sm text-white mx-2"
                  onClick={() => setAttendanceStatus("")}
                >
                  Marked Leave
                </div>
              </>
            )}
          </div>
        </header> 
      )}
      { role === "employee" && (
        <header className="p-2 flex items-center justify-between bg-white">
          <p className="font-bold text-xl">Create Assignment</p>
          <div 
            className="cursor-pointer bg-indigo-700 p-2 rounded-sm text-white mx-2 flex items-center justify-center gap-1"
          >
            <Plus />
            New 
          </div>
        </header>
      )}
      <div className="my-4 rounded-sm">
        <h2 className="font-bold p-2 text-xl">Posted Assignments</h2>
        {assignments.length === 0 && (
          <p className="text-gray-500 p-2">No assignments posted yet.</p>
        )}
        <div className="flex items-center flex-wrap">
        {assignments.map((assignment, index) => (
            <Assignment key={index} assignment={assignment} />
        ))} 
        </div>
      </div>
    </div>
  )
}

export default TeamPage;
