"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Project } from "@/types/leaderboard.ts";

interface Application {
  id: string;
  applicant: {
    name: string;
    email: string;
  };
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  dateOfApplication: string;
}

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectData: Project | null;
  refreshProject: () => void;
  isAuthor: boolean;
}

const EditTeamModal = ({ isOpen, onClose, projectData, refreshProject, isAuthor }: EditTeamModalProps) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch pending applications for the project
  useEffect(() => {
    if (isOpen && projectData?.id && isAuthor) {
      fetchApplications();
    }
  }, [isOpen, projectData?.id]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/applicants?projectId=${projectData?.id}&status=PENDING`);
      if (!response.ok) throw new Error("Failed to fetch applications");
      const data = await response.json();
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (applicationId: string, status: "ACCEPTED" | "REJECTED") => {
    try {
      const response = await fetch(`/api/applicants/${applicationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update application status");

      // Update local state
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status } : app))
      );
      refreshProject(); // Refresh project data
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (!isOpen || !projectData) return null;

  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-brightness-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">Manage Team - {projectData.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-4">
          {loading && <p className="text-sm text-gray-600 mb-4">Loading applications...</p>}
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <div className="space-y-3">
            {applications.map((application) => (
              <div
                key={application.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">
                      {application.applicant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{application.applicant.name}</p>
                    <p className="text-xs text-gray-500">{application.applicant.email}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApplicationStatus(application.id, "ACCEPTED")}
                    className="text-xs bg-black hover:bg-gray-800 text-white px-3 py-1.5 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleApplicationStatus(application.id, "REJECTED")}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end p-4 border-t">
          <button
            onClick={onClose}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTeamModal;