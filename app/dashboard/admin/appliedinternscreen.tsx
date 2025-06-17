"use client";

import { UserSearch } from "lucide-react";

export default function AppliedInternScreen() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 text-center">
      <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-cyan-100">
        <UserSearch className="h-8 w-8 text-cyan-600" />
      </div>
      <h2 className="mt-4 text-lg font-medium text-gray-900">
        Applied Interns Section
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        This section will display interns who have applied to your internship
        postings. You can review, shortlist, and manage applications here.
      </p>
    </div>
  );
}