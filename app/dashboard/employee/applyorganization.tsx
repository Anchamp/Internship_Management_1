"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2, Building, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
}

interface ApplyOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (organizationId: string) => void;
}

export default function ApplyOrganizationModal({
  isOpen,
  onClose,
  onApply,
}: ApplyOrganizationModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState("");
  const [orgSearchQuery, setOrgSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch organizations when component mounts
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!isOpen) return;

      setIsLoadingOrgs(true);
      setError("");

      try {
        const response = await fetch("/api/organizations");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch organizations");
        }

        setOrganizations(data.organizations || []);
      } catch (err: any) {
        console.error("Error fetching organizations:", err);
        setError(err.message || "Failed to load organizations");
        setOrganizations([]);
      } finally {
        setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [isOpen]);

  // Add clearOrgSearch function
  const clearOrgSearch = () => {
    setOrgSearchQuery("");
  };

  // Add filtered organizations logic with useMemo
  const filteredOrganizations = useMemo(() => {
    if (!orgSearchQuery.trim()) return organizations;
    return organizations.filter((org) =>
      org.name.toLowerCase().includes(orgSearchQuery.toLowerCase())
    );
  }, [organizations, orgSearchQuery]);

  // Update the handleApply function to make the API call and create notification
  const handleApply = async () => {
    if (!selectedOrganization) return;

    setIsSubmitting(true);

    try {
      // Get the current user from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        throw new Error("User session not found");
      }

      const userData = JSON.parse(storedUser);
      const { username, _id: requestorId, fullName } = userData;

      // Find the selected organization details
      const selectedOrg = organizations.find(
        (org) => org.id === selectedOrganization
      );
      if (!selectedOrg) {
        throw new Error("Selected organization not found");
      }

      // Call API to apply for the organization
      const response = await fetch("/api/employee/apply-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          organizationId: selectedOrganization,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply for organization");
      }

      // Create notification for admin
      const notificationResponse = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "verification_request",
          role: "employee",
          requestorId: requestorId,
          requestorName: fullName || username,
          organizationId: selectedOrganization,
          message: `${fullName || username} has requested to join ${
            selectedOrg.name
          }`,
          read: false,
          // Note: We're not specifying userId as the API will determine admin user(s) for this organization
          forOrganizationAdmins: true, // Flag to send to all admins of the organization
        }),
      });

      if (!notificationResponse.ok) {
        console.error(
          "Failed to create notification, but application was submitted"
        );
      }

      // Show success message
      toast.success("Application submitted successfully", {
        description: "Your application has been sent to the organization admin",
      });

      // Call the onApply callback if provided
      if (onApply) {
        onApply(selectedOrganization);
      }

      // Close the modal
      onClose();

      // Refresh the page to update the UI
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      console.error("Error applying for organization:", error);
      toast.error("Failed to apply for organization", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Modal Header - Added X icon for closing */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-100 p-4 border-b border-gray-200 relative">
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-cyan-600" />
            <h3 className="text-lg font-bold text-gray-900">
              Apply to Organization
            </h3>
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Close modal"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 md:p-5">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-gray-600 mb-4 text-sm">
            Select an organization to apply to. Approval grants access to their
            mentorship program.
          </p>

          {/* Organization Selection */}
          <div className="space-y-2 mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Select Organization
            </label>
            <Select
              value={selectedOrganization}
              onValueChange={setSelectedOrganization}
              disabled={isLoadingOrgs}
              onOpenChange={(open) => {
                if (!open) {
                  clearOrgSearch();
                }
              }}
            >
              <SelectTrigger className="w-full px-3 py-2 text-xs border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500 text-black bg-white">
                {isLoadingOrgs ? (
                  <span className="text-gray-400 flex items-center">
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    Loading...
                  </span>
                ) : selectedOrganization ? (
                  <SelectValue placeholder="Choose an organization" />
                ) : (
                  <span className="text-gray-400">Choose an organization</span>
                )}
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-300 shadow-lg max-h-[300px] overflow-y-auto z-[9999]">
                {/* Search Input within Dropdown */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-2 z-10">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search organizations..."
                      value={orgSearchQuery}
                      onChange={(e) => setOrgSearchQuery(e.target.value)}
                      className="pl-7 pr-3 py-1.5 text-xs border-gray-300 focus:ring-cyan-500 focus:border-cyan-500 bg-white text-black"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>

                {/* Organizations List */}
                <div className="max-h-[200px] overflow-y-auto">
                  {isLoadingOrgs ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-cyan-500 mr-2" />
                      <span className="text-xs text-gray-600">
                        Loading organizations...
                      </span>
                    </div>
                  ) : filteredOrganizations.length > 0 ? (
                    <div className="space-y-0.5">
                      {filteredOrganizations.map((org) => (
                        <SelectItem
                          key={org.id}
                          value={org.id}
                          className="text-black hover:bg-gray-100 cursor-pointer text-xs py-2 px-3 rounded-md"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-3 h-3 bg-cyan-500 rounded-full mr-2 opacity-80"></div>
                            <span>{org.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-3">
                      <div className="bg-gray-50 rounded-lg p-3 inline-flex items-center justify-center mb-2">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-500 font-medium">
                        {organizations.length > 0
                          ? "No matching organizations found"
                          : "No organizations available"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {organizations.length > 0
                          ? "Try a different search term"
                          : "Please contact an administrator"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer with Organization Count */}
                {organizations.length > 0 && !isLoadingOrgs && (
                  <div className="border-t border-gray-200 py-2 px-3 text-xs text-gray-500 bg-gray-50">
                    {filteredOrganizations.length} of {organizations.length}{" "}
                    organizations
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleApply}
              disabled={!selectedOrganization || isLoadingOrgs || isSubmitting}
              className="w-full px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-md shadow-sm text-sm hover:opacity-90 transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
