"use client";

import { useState } from "react";
import FindInternships from "./find-internships";
import InternshipApplication from "./internship-request";

interface InternshipPost {
  _id: string;
  title: string;
  organizationName: string;
  organizationLogo?: string;
  department: string;
  mode: string;
  location: {
    city: string;
    state: string;
    country: string;
    address: string;
  };
  startDate: string;
  endDate: string;
  openings: number;
  isPaid: boolean;
  stipend?: string;
  skills: string[];
  responsibilities: string[];
  postingDate: string;
  applicationDeadline: string;
  status: string;
  eligibility: string;
  category: string;
  organizationId: string;
}

export default function FindApplyInternships() {
  const [currentView, setCurrentView] = useState<"browse" | "apply">("browse");
  const [selectedInternship, setSelectedInternship] = useState<InternshipPost | null>(null);

  const handleApplyClick = (internship: InternshipPost) => {
    setSelectedInternship(internship);
    setCurrentView("apply");
  };

  const handleBackToBrowse = () => {
    setCurrentView("browse");
    setSelectedInternship(null);
  };

  const handleApplicationSubmitted = () => {
    // Go back to browse view and refresh
    setCurrentView("browse");
    setSelectedInternship(null);
    // The parent component should handle any necessary refreshes
  };

  if (currentView === "apply") {
    return (
      <InternshipApplication
        selectedInternship={selectedInternship}
        onBack={handleBackToBrowse}
        onApplicationSubmitted={handleApplicationSubmitted}
      />
    );
  }

  return (
    <FindInternships onApplyClick={handleApplyClick} />
  );
}