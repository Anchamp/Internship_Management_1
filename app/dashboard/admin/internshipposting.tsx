"use client";

import { useState } from "react";
import CreatePostScreen from "./createpostscreen";
import AppliedInternScreen from "./appliedinternscreen";

export default function InternshipPosting() {
  const [activeTab, setActiveTab] = useState<string>("createPost");

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm p-1 flex space-x-1">
        <button
          onClick={() => setActiveTab("createPost")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "createPost"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Create Post
        </button>
        <button
          onClick={() => setActiveTab("appliedIntern")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === "appliedIntern"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          Applied Interns
        </button>
      </div>

      {/* Content Area */}
      {activeTab === "createPost" && <CreatePostScreen />}
      {activeTab === "appliedIntern" && <AppliedInternScreen />}
    </div>
  );
}
