import React, { useEffect, useState, useCallback } from "react";
import {
  FileCheck2,
  Mail,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  FileQuestion,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import Badge from "../common/Badge";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const DOC_LABELS = {
  REGISTRATION_CERTIFICATE: "Registration Certificate",
  GST_TAX_CERTIFICATE: "GST / Tax Certificate",
  BANK_DOCUMENT: "Bank Document",
};

const DocumentChecklist = ({ vendorId, onEmailSent }) => {
  const [checklist, setChecklist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendingType, setSendingType] = useState(null);

  const fetchChecklist = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DOCUMENTS.CHECKLIST(vendorId)
      );
      setChecklist(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching document checklist:", error);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    fetchChecklist();
  }, [vendorId, fetchChecklist]);

  const handleSendEmail = async (docType) => {
    setSendingType(docType);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.DOCUMENTS.SEND_MISSING_EMAIL(vendorId),
        { missingDocType: docType }
      );
      toast.success(
        response.data?.message || "Missing document request email sent!"
      );
      if (onEmailSent) onEmailSent();
      fetchChecklist();
    } catch (error) {
      console.error("Error sending missing document email:", error);
    } finally {
      setSendingType(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Mandatory Compliance Checklist
            </h3>
            <p className="text-xs text-slate-500">
              Tracking required registration, tax, and banking documents for vendor verification
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={fetchChecklist}
          disabled={isLoading}
        >
          Refresh Checklist
        </Button>
      </div>

      {/* Checklist Grid Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3"
            >
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
              <div className="h-8 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {checklist.map((item) => {
            const label = DOC_LABELS[item.type] || item.type;
            const isMissing = item.status === "MISSING";
            const doc = item.document;

            return (
              <div
                key={item.type}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-4 transition-all ${
                  isMissing
                    ? "border-rose-200 bg-rose-50/20"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <div className="space-y-2">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-extrabold text-slate-900 leading-tight">
                      {label}
                    </h4>
                    {isMissing ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        <AlertCircle className="w-3 h-3" /> Missing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Available
                      </span>
                    )}
                  </div>

                  {/* Document metadata or missing prompt */}
                  {doc ? (
                    <div className="text-xs space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      <p className="font-bold text-slate-800 truncate">
                        {doc.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Uploaded: {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No document has been uploaded for this category yet.
                    </p>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-2 border-t border-slate-200/80">
                  {isMissing ? (
                    <Button
                      size="sm"
                      variant="danger"
                      className="w-full text-xs"
                      isLoading={sendingType === item.type}
                      onClick={() => handleSendEmail(item.type)}
                      icon={Mail}
                    >
                      Send Missing Email
                    </Button>
                  ) : doc?.fileUrl ? (
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${doc.fileUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <span>View File</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-emerald-700 font-bold block text-center py-1">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DocumentChecklist;
