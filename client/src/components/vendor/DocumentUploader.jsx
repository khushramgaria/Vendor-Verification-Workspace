import React, { useState } from "react";
import { UploadCloud, FileText, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const DOC_TYPES = [
  {
    value: "REGISTRATION_CERTIFICATE",
    label: "Registration Certificate",
    description: "Official company incorporation or business registration proof",
  },
  {
    value: "GST_TAX_CERTIFICATE",
    label: "GST / Tax Certificate",
    description: "Tax identification or GSTIN registration certificate",
  },
  {
    value: "BANK_DOCUMENT",
    label: "Bank Document",
    description: "Cancelled cheque, bank statement, or passbook copy",
  },
];

const DocumentUploader = ({ vendorId, onUploadSuccess }) => {
  const [selectedDocType, setSelectedDocType] = useState(
    "REGISTRATION_CERTIFICATE"
  );
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("docType", selectedDocType);

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DOCUMENTS.UPLOAD_AND_EXTRACT(vendorId),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const result = response.data;
      toast.success("Document uploaded & AI extraction complete!");

      if (result.mismatchFound) {
        toast.error("Mismatch detected between document and saved vendor data!", {
          duration: 5000,
        });
      }

      setFile(null);
      if (onUploadSuccess) onUploadSuccess(result);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AI Document Processing
            </h3>
            <p className="text-xs text-slate-500">
              Upload compliance documents for automated Gemini 2.5 extraction & mismatch audit
            </p>
          </div>
        </div>
      </div>

      {/* Select Document Type */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          1. Select Document Category
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOC_TYPES.map((type) => {
            const isSelected = selectedDocType === type.value;
            return (
              <div
                key={type.value}
                onClick={() => setSelectedDocType(type.value)}
                className={`p-3 rounded-xl border text-left cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/50 shadow-2xs"
                    : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/60 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    {type.label}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  {type.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dropzone Upload Area */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
          2. Attach Document File
        </label>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-150 ${
            isDragOver
              ? "border-blue-500 bg-blue-50/60 scale-[0.99]"
              : file
              ? "border-emerald-300 bg-emerald-50/30"
              : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading ? (
            <div className="py-4 space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  Gemini AI Analyzing Document...
                </p>
                <p className="text-xs text-slate-500">
                  Extracting registration IDs, tax numbers, and bank credentials.
                </p>
              </div>
            </div>
          ) : file ? (
            <div className="py-2 flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="file-upload"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer px-2 py-1"
                >
                  Change
                </label>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <label
              htmlFor="file-upload"
              className="cursor-pointer block py-4 space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-500">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload <span className="text-slate-500 font-normal">or drag and drop</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  PNG, JPG, PDF up to 10MB
                </p>
              </div>
            </label>
          )}
        </div>
      </div>

      {/* Upload Action */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          onClick={handleUpload}
          isLoading={isUploading}
          disabled={!file}
          icon={Sparkles}
        >
          Process Document with AI
        </Button>
      </div>
    </div>
  );
};

export default DocumentUploader;
