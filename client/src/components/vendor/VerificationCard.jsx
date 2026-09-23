import React, { useState } from "react";
import {
  Globe,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "../common/Button";
import Badge from "../common/Badge";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const VerificationCard = ({ vendor, onVerificationUpdated }) => {
  const [isVerifying, setIsVerifying] = useState(false);

  const verificationStatus =
    vendor?.externalVerificationStatus || "UNABLE_TO_VERIFY";
  const externalData = vendor?.externalData || null;

  const handleVerify = async () => {
    if (!vendor?.id) return;
    setIsVerifying(true);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.VERIFICATION.EXTERNAL_VERIFY(vendor.id),
      );

      const result = response.data;
      if (result.verificationResult === "VERIFIED") {
        toast.success("Company successfully verified!");
      } else if (result.verificationResult === "MISMATCH") {
        toast.error("Company mismatch detected on external registry!");
      } else {
        toast("No exact match found", {
          icon: "ℹ️",
        });
      }

      if (onVerificationUpdated) {
        onVerificationUpdated(result.vendor);
      }
    } catch (error) {
      console.error("Verification error:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-2xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              External Registry Audit
            </h3>
            <p className="text-xs text-slate-500">
              Cross-checks company registration & legal entity details against
              global public registries
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={handleVerify}
          isLoading={isVerifying}
          icon={RefreshCw}
        >
          Verify
        </Button>
      </div>

      {/* Status Overview Row */}
      <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Verification Result:
          </span>
          <Badge status={verificationStatus} />
        </div>

        <span className="text-[11px] text-slate-500 font-medium">
          Source: MOCK API
        </span>
      </div>

      {/* External Matched Metadata */}
      {externalData && externalData.companyNumber ? (
        <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-blue-950 uppercase tracking-wider">
              Matched External Entity Data
            </h4>
            {externalData.opencorporatesUrl && (
              <a
                href={externalData.opencorporatesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                <span>View Full Registry Profile</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Registry Entity Name
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block truncate">
                {externalData.name}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Company Number
              </span>
              <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                {externalData.companyNumber}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Jurisdiction
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block uppercase">
                {externalData.jurisdiction || "N/A"}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-blue-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">
                Incorporation Date
              </span>
              <span className="font-bold text-slate-900 mt-0.5 block">
                {externalData.incorporationDate || "Unspecified"}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-500 space-y-1">
          <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            No external match record fetched yet
          </p>
          <p className="text-[11px] text-slate-500">
            Click "Verify" above to run global corporate lookup.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationCard;
