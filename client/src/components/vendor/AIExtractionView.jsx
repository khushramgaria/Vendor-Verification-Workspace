import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Sparkles, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const AIExtractionView = ({
  vendor,
  extractedData = null,
  mismatchFound = false,
  mismatchDetails = [],
  onDataApplied,
}) => {
  const [isApplying, setIsApplying] = useState(false);

  if (!extractedData || Object.keys(extractedData).length === 0) {
    return null;
  }

  const normalizedDetails = Array.isArray(mismatchDetails)
    ? mismatchDetails
    : typeof mismatchDetails === "string" && mismatchDetails.length > 0
    ? mismatchDetails.split(" | ")
    : [];

  const handleApplyExtractedData = async () => {
    if (!vendor?.id) return;
    setIsApplying(true);

    // Filter out null/undefined values from extractedData
    const updatePayload = {};
    Object.keys(extractedData).forEach((key) => {
      if (extractedData[key] !== null && extractedData[key] !== undefined) {
        updatePayload[key] = extractedData[key];
      }
    });

    try {
      await apiClient.put(
        API_ENDPOINTS.VENDORS.UPDATE(vendor.id),
        updatePayload
      );
      toast.success("Vendor details updated with AI extracted document data!");
      if (onDataApplied) onDataApplied();
    } catch (error) {
      console.error("Error updating vendor with AI data:", error);
    } finally {
      setIsApplying(false);
    }
  };

  const fieldsToCompare = [
    { key: "companyName", label: "Company Name" },
    { key: "registrationNumber", label: "Registration Number" },
    { key: "taxNumber", label: "GST / Tax Number" },
    { key: "bankAccountNumber", label: "Bank Account Number" },
    { key: "ifscCode", label: "IFSC Code" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-5 shadow-2xs">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              AI Extracted Data vs Saved Record
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side comparison of document OCR results against registered vendor database
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleApplyExtractedData}
          isLoading={isApplying}
          icon={RefreshCw}
        >
          Apply AI Extracted Data
        </Button>
      </div>

      {/* Prominent Mismatch Alert Banner */}
      {mismatchFound && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl space-y-1">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Mismatch Detected in Document</span>
          </div>
          {normalizedDetails.length > 0 ? (
            <ul className="pl-6 list-disc text-xs text-amber-900 font-medium space-y-0.5">
              {normalizedDetails.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-amber-900 font-medium pl-6">
              Extracted values differ from currently saved vendor credentials.
            </p>
          )}
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-3 px-4">Field Attribute</th>
              <th className="py-3 px-4">AI Extracted from Document</th>
              <th className="py-3 px-4">Currently Saved Record</th>
              <th className="py-3 px-4 text-center">Match Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {fieldsToCompare.map(({ key, label }) => {
              const extractedVal = extractedData[key];
              const savedVal = vendor ? vendor[key] : "";

              const isMatch =
                extractedVal &&
                savedVal &&
                String(extractedVal).toLowerCase().trim() ===
                  String(savedVal).toLowerCase().trim();

              const hasConflict =
                extractedVal &&
                savedVal &&
                String(extractedVal).toLowerCase().trim() !==
                  String(savedVal).toLowerCase().trim();

              return (
                <tr key={key} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {label}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {extractedVal ? (
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-bold">
                        {extractedVal}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Not found in doc</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {savedVal ? (
                      <span>{savedVal}</span>
                    ) : (
                      <span className="text-slate-400 italic">Unspecified</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isMatch ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Match
                      </span>
                    ) : hasConflict ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Differs
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIExtractionView;
