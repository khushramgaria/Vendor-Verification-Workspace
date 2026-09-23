import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Landmark,
  FileText,
  Sparkles,
  FileCheck2,
  FileEdit,
  CheckSquare,
  Globe,
} from "lucide-react";
import Modal from "../common/Modal";
import Badge from "../common/Badge";
import Button from "../common/Button";
import DocumentUploader from "./DocumentUploader";
import AIExtractionView from "./AIExtractionView";
import DocumentChecklist from "./DocumentChecklist";
import VerificationCard from "./VerificationCard";
import WorkflowStatusPicker from "./WorkflowStatusPicker";
import TaskManagementSection from "./TaskManagementSection";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const VendorDetailModal = ({
  isOpen,
  onClose,
  vendor: initialVendor,
  onEdit,
  onViewHistory,
  onVendorUpdated,
}) => {
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [aiExtractionResult, setAiExtractionResult] = useState(null);
  const [currentVendor, setCurrentVendor] = useState(initialVendor);

  const fetchLatestVendor = useCallback(async () => {
    if (!initialVendor?.id) return;
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.VENDORS.BY_ID(initialVendor.id)
      );
      if (response.data?.data) {
        setCurrentVendor(response.data.data);
      }
    } catch (error) {
      console.error("Error refreshing vendor detail:", error);
    }
  }, [initialVendor?.id]);

  useEffect(() => {
    setCurrentVendor(initialVendor);
  }, [initialVendor]);

  if (!currentVendor) return null;

  const handleUploadSuccess = (result) => {
    setAiExtractionResult(result);
    fetchLatestVendor();
    if (onVendorUpdated) onVendorUpdated();
  };

  const handleDataApplied = () => {
    fetchLatestVendor();
    if (onVendorUpdated) onVendorUpdated();
  };

  const handleVerificationUpdated = (updatedVendor) => {
    if (updatedVendor) {
      setCurrentVendor(updatedVendor);
    } else {
      fetchLatestVendor();
    }
    if (onVendorUpdated) onVendorUpdated();
  };

  const tasks = currentVendor.tasks || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentVendor.companyName}
      subtitle={`Registration Number: ${currentVendor.registrationNumber || "N/A"}`}
      icon={Building2}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab("OVERVIEW")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "OVERVIEW"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Overview & Status</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("AI_VERIFICATION")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "AI_VERIFICATION"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Document Upload & AI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("CHECKLIST")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "CHECKLIST"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
            <span>Checklist & Emails</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("TASKS")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "TASKS"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Tasks ({tasks.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview, Workflow Control & External Registry */}
        {activeTab === "OVERVIEW" && (
          <div className="space-y-5">
            {/* Workflow Status Picker Component */}
            <WorkflowStatusPicker
              vendor={currentVendor}
              onStatusUpdated={handleVerificationUpdated}
            />

            {/* External Registry Verification Card Component */}
            <VerificationCard
              vendor={currentVendor}
              onVerificationUpdated={handleVerificationUpdated}
            />

            {/* Contact Info Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                Contact & Identification
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Contact Person
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentVendor.contactPerson}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email Address
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentVendor.email}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone Number
                    </span>
                    <span className="text-sm font-bold text-slate-900">
                      {currentVendor.phone}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-start gap-3">
                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      GST / Tax ID Number
                    </span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {currentVendor.taxNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Address */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Registered Address
                </span>
              </div>
              <p className="text-sm font-medium text-slate-800 leading-relaxed pl-6">
                {currentVendor.address}
              </p>
            </div>

            {/* Banking Information */}
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
                  Banking & Settlement Details
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      Bank Account Number
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {currentVendor.bankAccountNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Landmark className="w-4 h-4 text-blue-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      IFSC Code
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {currentVendor.ifscCode}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Document Upload & AI Verification */}
        {activeTab === "AI_VERIFICATION" && (
          <div className="space-y-6">
            <DocumentUploader
              vendorId={currentVendor.id}
              onUploadSuccess={handleUploadSuccess}
            />

            {aiExtractionResult && (
              <AIExtractionView
                vendor={currentVendor}
                extractedData={aiExtractionResult.extractedData}
                mismatchFound={aiExtractionResult.mismatchFound}
                mismatchDetails={aiExtractionResult.mismatchDetails}
                onDataApplied={handleDataApplied}
              />
            )}
          </div>
        )}

        {/* Tab 3: Compliance Checklist & Email Automation */}
        {activeTab === "CHECKLIST" && (
          <DocumentChecklist
            vendorId={currentVendor.id}
            onEmailSent={handleDataApplied}
          />
        )}

        {/* Tab 4: Task Management */}
        {activeTab === "TASKS" && (
          <TaskManagementSection
            vendorId={currentVendor.id}
            tasks={tasks}
            onTasksUpdated={fetchLatestVendor}
          />
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onClose();
              onViewHistory(currentVendor.id);
            }}
          >
            Audit History
          </Button>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={FileEdit}
              onClick={() => {
                onClose();
                onEdit(currentVendor);
              }}
            >
              Edit Details
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VendorDetailModal;
