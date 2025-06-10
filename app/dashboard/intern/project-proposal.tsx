"use client";

import { useState } from "react";
import { Briefcase, Target, Code, Calendar, Save, Send } from "lucide-react";

export default function ProjectProposalScreen() {
  const [proposalData, setProposalData] = useState({
    projectTitle: "",
    projectDescription: "",
    objectives: "",
    techStack: "",
    timeline: "",
    deliverables: "",
    learningOutcomes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProposalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Project proposal submitted successfully!");
    } catch (error) {
      console.error("Error submitting proposal:", error);
      alert("Failed to submit proposal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold border-b pb-2">Project Proposal</h2>
        <p className="text-sm text-gray-600 mt-2">
          Submit your project proposal for review by your assigned guide
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Title <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="projectTitle"
              value={proposalData.projectTitle}
              onChange={handleChange}
              required
              placeholder="Enter your project title"
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="projectDescription"
            value={proposalData.projectDescription}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Provide a detailed description of your project..."
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Objectives <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute top-2 left-3 pointer-events-none">
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              name="objectives"
              value={proposalData.objectives}
              onChange={handleChange}
              required
              rows={3}
              placeholder="List the main objectives of your project..."
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technology Stack <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Code className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              name="techStack"
              value={proposalData.techStack}
              onChange={handleChange}
              required
              placeholder="e.g., React, Node.js, MongoDB, AWS"
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Timeline & Milestones
          </label>
          <div className="relative">
            <div className="absolute top-2 left-3 pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <textarea
              name="timeline"
              value={proposalData.timeline}
              onChange={handleChange}
              rows={3}
              placeholder="Describe your project timeline and key milestones..."
              className="pl-10 w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deliverables
          </label>
          <textarea
            name="deliverables"
            value={proposalData.deliverables}
            onChange={handleChange}
            rows={3}
            placeholder="List the expected deliverables..."
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Learning Outcomes
          </label>
          <textarea
            name="learningOutcomes"
            value={proposalData.learningOutcomes}
            onChange={handleChange}
            rows={3}
            placeholder="What do you expect to learn from this project?"
            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-md hover:from-cyan-600 hover:to-blue-700 flex items-center disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Proposal
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}