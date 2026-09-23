import React, { useState } from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, Clock, FileEdit, XCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Badge from "../common/Badge";
import Button from "../common/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const WORKFLOW_STAGES = [
  {
    key: "DRAFT",
    label: "Draft",
    icon: FileEdit,
    description: "Initial vendor registration",
  },
  {
    key: "UNDER_REVIEW",
    label: "Under Review",
    icon: Clock,
    description: "Compliance team auditing documents & data",
  },
  {
    key: "ACTION_REQUIRED",
    label: "Action Required",
    icon: AlertTriangle,
    description: "Missing documents or mismatch detected",
  },
  {
    key: "APPROVED",
    label: "Approved",
    icon: CheckCircle2,
    description: "Vendor verified & onboarding completed",
  },
  {
    key: "REJECTED",
    label: "Rejected",
    icon: XCircle,
    description: "Failed compliance audit requirements",
  },
];

const WorkflowStatusPicker = ({ vendor, onStatusUpdated }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const currentStatus = vendor?.status || "DRAFT";

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus || !vendor?.id) return;
    setIsUpdating(true);

    try {
      const response = await apiClient.patch(
        API_ENDPOINTS.VERIFICATION.UPDATE_STATUS(vendor.id),
        { status: newStatus }
      );

      toast.success(`Workflow status updated to ${newStatus.replace(/_/g, " ")}`);
      if (onStatusUpdated) {
        onStatusUpdated(response.data?.data);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Vendor Onboarding Lifecycle Stage
            </h3>
            <p className="text-xs text-slate-500">
              Reviewer workflow control & state transition management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold uppercase">
            Current Stage:
          </span>
          <Badge status={currentStatus} />
        </div>
      </div>

      {/* Stage Stepper / Selection Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {WORKFLOW_STAGES.map((stage) => {
          const StageIcon = stage.icon;
          const isActive = currentStatus === stage.key;

          return (
            <button
              key={stage.key}
              type="button"
              disabled={isUpdating}
              onClick={() => handleStatusChange(stage.key)}
              className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer disabled:opacity-60 ${
                isActive
                  ? "border-blue-600 bg-blue-50/70 shadow-2xs ring-2 ring-blue-500/20"
                  : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <StageIcon
                  className={`w-4 h-4 ${
                    isActive ? "text-blue-600" : "text-slate-500"
                  }`}
                />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <p
                className={`text-xs font-bold ${
                  isActive ? "text-blue-900" : "text-slate-800"
                }`}
              >
                {stage.label}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2 leading-tight">
                {stage.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowStatusPicker;
