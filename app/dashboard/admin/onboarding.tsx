"use client";

import { useState } from "react";
import {
  Check,
  X,
  Mail,
  Phone,
  User,
  Building,
  Calendar,
  MapPin,
  FileText,
  Briefcase,
  Globe,
  Clock, // Added missing Clock import
  Users, // Make sure Users is imported for the empty state
} from "lucide-react";
import Image from "next/image";

// Mock data for mentors awaiting verification (Indian context)
const mentorsMockData = [
  {
    id: "m1",
    username: "anitakumar",
    fullName: "Anita Kumar",
    email: "anita.kumar@techindia.com",
    phone: "+91 98765 43210",
    organization: "none",
    position: "Senior Software Architect",
    address: "72, Richmond Road, Bengaluru, Karnataka",
    experience: "8 years",
    skills: "React, Node.js, AWS, TypeScript, GraphQL",
    bio: "Full-stack developer with expertise in cloud architecture. Passionate about building scalable applications and mentoring junior developers in the latest technologies.",
    website: "https://anitakumar.dev",
    profileImage: "",
    dob: "1991-06-12",
    teams: ["Frontend", "Cloud Architecture", "DevOps"],
    status: "pending",
  },
  {
    id: "m2",
    username: "rajeshpatel",
    fullName: "Rajesh Patel",
    email: "rajesh.patel@designindia.com",
    phone: "+91 87654 32109",
    organization: "none",
    position: "UX Design Lead",
    address: "15, Linking Road, Bandra, Mumbai, Maharashtra",
    experience: "7 years",
    skills: "UI/UX, Figma, Adobe XD, Product Design, Design Thinking",
    bio: "Design leader focused on creating intuitive user experiences for Indian market. Experienced in blending global design principles with local cultural context.",
    website: "https://rajeshpatel.design",
    profileImage: "",
    dob: "1990-03-24",
    teams: ["Design", "Product", "Research"],
    status: "pending",
  },
  {
    id: "m3",
    username: "priyasharma",
    fullName: "Priya Sharma",
    email: "priya.sharma@dataindia.com",
    phone: "+91 76543 21098",
    organization: "none",
    position: "Data Science Manager",
    address: "45, Sector 18, Gurgaon, Haryana",
    experience: "10 years",
    skills: "Python, Machine Learning, Data Visualization, SQL, TensorFlow",
    bio: "Data scientist with expertise in AI applications for business intelligence. Passionate about applying data science to solve challenges unique to the Indian market.",
    website: "https://priyasharma.ai",
    dob: "1987-11-08",
    teams: ["Data Science", "AI Research"],
    status: "pending",
  },
  {
    id: "m4",
    username: "vikramagarwal",
    fullName: "Vikram Agarwal",
    email: "vikram.agarwal@mobileindia.tech",
    phone: "+91 65432 10987",
    organization: "none",
    position: "Mobile Development Lead",
    address: "28, Anna Salai, Chennai, Tamil Nadu",
    experience: "6 years",
    skills: "Android, iOS, React Native, Flutter, Firebase",
    bio: "Mobile app developer specialized in developing solutions for diverse Indian user bases. Experienced in building apps that work across varying network conditions.",
    website: "https://vikramagarwal.dev",
    profileImage: "",
    dob: "1992-09-17",
    teams: ["Mobile", "Cross-Platform"],
    status: "pending",
  },
];

// Mock data for panelists awaiting verification (Indian context)
const panelistsMockData = [
  {
    id: "p1",
    username: "nehaverma",
    fullName: "Neha Verma",
    email: "neha.verma@techindia.org",
    phone: "+91 54321 09876",
    organization: "none",
    position: "CTO",
    address: "56, Koramangala, Bengaluru, Karnataka",
    experience: "15 years",
    skills: "Technical Leadership, System Architecture, Strategic Planning",
    bio: "Technology executive with experience leading Indian startups to international recognition. Passionate about fostering innovation in India's tech ecosystem.",
    website: "https://nehaverma.tech",
    profileImage: "",
    dob: "1980-02-28",
    teams: ["Executive", "Technical Review"],
    status: "pending",
  },
  {
    id: "p2",
    username: "rameshsingh",
    fullName: "Ramesh Singh",
    email: "ramesh.singh@engineerindia.com",
    phone: "+91 43210 98765",
    organization: "none",
    position: "VP of Engineering",
    address: "112, Salt Lake, Kolkata, West Bengal",
    experience: "12 years",
    skills: "Engineering Management, Enterprise Architecture, Cloud Migration",
    bio: "Engineering leader with deep experience in building tech teams across India. Advocate for engineering excellence and sustainable development practices.",
    website: "https://rameshsingh.in",
    profileImage: "",
    dob: "1983-07-19",
    teams: ["Engineering", "Architecture"],
    status: "pending",
  },
  {
    id: "p3",
    username: "divyakapoor",
    fullName: "Divya Kapoor",
    email: "divya.kapoor@productindia.org",
    phone: "+91 32109 87654",
    organization: "none",
    position: "Director of Product Management",
    address: "78, Aundh, Pune, Maharashtra",
    experience: "9 years",
    skills: "Product Strategy, User Research, Agile Methodologies",
    bio: "Product leader focused on developing solutions that address uniquely Indian challenges. Experienced in crafting products that balance global standards with local needs.",
    website: "https://divyakapoor.co.in",
    profileImage: "",
    dob: "1988-12-03",
    teams: ["Product", "Strategy"],
    status: "pending",
  },
];

export default function OnboardingScreen() {
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [processingUser, setProcessingUser] = useState<string | null>(null);

  const handleAccept = (userId: string, role: string) => {
    setProcessingUser(userId);
    // Simulate API call
    setTimeout(() => {
      console.log(`User ${userId} (${role}) has been accepted`);
      setProcessingUser(null);

      // If modal is open for this user, close it
      if (modalOpen && selectedUser?.id === userId) {
        setModalOpen(false);
        setSelectedUser(null);
      }
    }, 1500);
  };

  const openModal = (user: any) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Generate profile letter avatar
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  // User Card Component with updated styling
  const UserCard = ({ user }: { user: any }) => (
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => openModal(user)}
    >
      <div className="flex items-center mb-2 sm:mb-0 w-full sm:w-auto">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg mr-4 flex-shrink-0">
          {user.profileImage ? (
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={user.profileImage}
                alt={user.fullName}
                width={48}
                height={48}
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : (
            getInitial(user.fullName)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate">
            {user.fullName}
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-600 mt-1 space-y-1 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center">
                <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleAccept(user.id, user.role);
        }}
        disabled={processingUser === user.id}
        className="mt-2 sm:mt-0 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-medium rounded-md flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] justify-center shadow-sm"
      >
        {processingUser === user.id ? (
          <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full mr-2"></div>
        ) : (
          <Check className="h-4 w-4 mr-2" />
        )}
        Approve
      </button>
    </div>
  );

  // User Modal Component with improved styling
  const UserModal = () => {
    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
            <h3 className="text-xl font-bold text-gray-900">
              User Profile Details
            </h3>
            <button
              onClick={closeModal}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center mb-8 sm:space-x-6">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center text-white text-3xl font-bold mb-4 sm:mb-0 shadow-xl">
                {selectedUser.profileImage ? (
                  <Image
                    src={selectedUser.profileImage}
                    alt={selectedUser.fullName}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  getInitial(selectedUser.fullName)
                )}
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-2xl font-bold text-gray-900 mb-1">
                  {selectedUser.fullName}
                </h4>
                <p className="text-indigo-600">@{selectedUser.username}</p>
                <p className="text-gray-700 mt-2">{selectedUser.position}</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="mb-8">
              <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                Personal Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                {selectedUser.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">Phone</p>
                      <p className="text-gray-900">{selectedUser.phone}</p>
                    </div>
                  </div>
                )}

                {selectedUser.dob && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Date of Birth
                      </p>
                      <p className="text-gray-900">{selectedUser.dob}</p>
                    </div>
                  </div>
                )}

                {selectedUser.address && (
                  <div className="flex items-start col-span-1 md:col-span-2">
                    <MapPin className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Address
                      </p>
                      <p className="text-gray-900">{selectedUser.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information */}
            <div className="mb-8">
              <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                Professional Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Organization
                    </p>
                    <p className="text-gray-900">
                      {selectedUser.organization === "none"
                        ? "Pending Assignment"
                        : selectedUser.organization}
                    </p>
                  </div>
                </div>

                {selectedUser.position && (
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Position
                      </p>
                      <p className="text-gray-900">{selectedUser.position}</p>
                    </div>
                  </div>
                )}

                {selectedUser.experience && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Experience
                      </p>
                      <p className="text-gray-900">{selectedUser.experience}</p>
                    </div>
                  </div>
                )}

                {selectedUser.website && (
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-indigo-500 mt-0.5 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Website
                      </p>
                      <p className="text-gray-900">
                        <a
                          href={selectedUser.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          {selectedUser.website}
                        </a>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Skills & Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {selectedUser.skills && (
                <div>
                  <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Skills & Expertise
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.skills
                      .split(",")
                      .map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-3 py-1.5 text-sm rounded-full font-medium"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {selectedUser.teams && selectedUser.teams.length > 0 && (
                <div>
                  <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                    Teams
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedUser.teams.map((team: string, index: number) => (
                      <span
                        key={index}
                        className="bg-indigo-50 text-indigo-700 px-3 py-1.5 text-sm rounded-full font-medium"
                      >
                        {team}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div className="mb-6">
                <h5 className="text-base font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">
                  Bio / Professional Summary
                </h5>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                  {selectedUser.bio}
                </p>
              </div>
            )}
          </div>

          <div className="p-5 border-t sticky bottom-0 bg-white shadow-inner">
            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleAccept(
                    selectedUser.id,
                    selectedUser.id.startsWith("m") ? "mentor" : "panelist"
                  )
                }
                disabled={processingUser === selectedUser.id}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-sm transition-colors"
              >
                {processingUser === selectedUser.id ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                Approve User
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-6">
        {/* Mentor Verification Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="p-5 border-b bg-gradient-to-r from-cyan-50 to-cyan-100">
            <h2 className="text-xl font-bold text-gray-800">
              Mentor Verification
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve mentor applications
            </p>
          </div>
          <div className="h-96 overflow-y-auto">
            {mentorsMockData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="bg-cyan-50 p-3 rounded-full mb-2">
                  <User className="h-6 w-6 text-cyan-500" />
                </div>
                <p>No pending mentor verifications</p>
              </div>
            ) : (
              mentorsMockData.map((mentor) => (
                <UserCard key={mentor.id} user={mentor} />
              ))
            )}
          </div>
        </div>

        {/* Panelist Verification Section */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
          <div className="p-5 border-b bg-gradient-to-r from-indigo-50 to-indigo-100">
            <h2 className="text-xl font-bold text-gray-800">
              Panelist Verification
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Review and approve panelist applications
            </p>
          </div>
          <div className="h-96 overflow-y-auto">
            {panelistsMockData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
                <div className="bg-indigo-50 p-3 rounded-full mb-2">
                  <Users className="h-6 w-6 text-indigo-500" />
                </div>
                <p>No pending panelist verifications</p>
              </div>
            ) : (
              panelistsMockData.map((panelist) => (
                <UserCard key={panelist.id} user={panelist} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* User detail modal */}
      {modalOpen && <UserModal />}
    </>
  );
}
