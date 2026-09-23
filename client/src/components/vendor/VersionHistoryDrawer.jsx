import React, { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { History, RotateCcw } from "lucide-react";
import Drawer from "../common/Drawer";
import Button from "../common/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const formatFieldName = (fieldName) => {
  if (!fieldName) return "";
  if (fieldName === "INITIAL_CREATION") return "Initial Creation";
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
};

const VersionHistoryDrawer = ({
  isOpen,
  onClose,
  vendorId,
  onRestored,
}) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [vendorName, setVendorName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState(null);

  const fetchVendorHistory = useCallback(async () => {
    if (!vendorId) return;
    setIsLoading(true);
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.VENDORS.BY_ID(vendorId)
      );
      const vendorData = response.data?.data;
      if (vendorData) {
        setVendorName(vendorData.companyName || "");
        setHistoryItems(vendorData.history || []);
      }
    } catch (error) {
      console.error("Error fetching vendor history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [vendorId]);

  useEffect(() => {
    if (isOpen && vendorId) {
      fetchVendorHistory();
    } else {
      setHistoryItems([]);
      setVendorName("");
    }
  }, [isOpen, vendorId, fetchVendorHistory]);

  const handleRestore = async (historyId, fieldChanged) => {
    setRestoringId(historyId);
    try {
      await apiClient.post(
        API_ENDPOINTS.VENDORS.RESTORE_VERSION(vendorId, historyId)
      );
      toast.success(
        `Restored ${formatFieldName(fieldChanged)} to previous state!`
      );
      if (onRestored) onRestored();
      fetchVendorHistory();
    } catch (error) {
      console.error("Error restoring version:", error);
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Version Audit History"
      subtitle={vendorName ? `Tracking audit changes for ${vendorName}` : "Timeline of all edits and field changes"}
      width="max-w-lg"
    >
      {isLoading ? (
        <div className="space-y-4 py-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2"
            >
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="font-semibold text-slate-700">No version history</p>
          <p className="text-xs text-slate-500 mt-1">
            No tracked field edits have been recorded for this vendor yet.
          </p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {historyItems.map((item) => {
            const isInitial = item.fieldChanged === "INITIAL_CREATION";

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={`absolute -left-[1.95rem] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                    isInitial ? "bg-emerald-500 ring-2 ring-emerald-100" : "bg-blue-600 ring-2 ring-blue-100"
                  }`}
                />

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors space-y-3">
                  {/* Version Header */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      Version {item.version}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : ""}
                    </span>
                  </div>

                  {/* Changed Field Title */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Field Changed
                    </h4>
                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                      {formatFieldName(item.fieldChanged)}
                    </p>
                  </div>

                  {/* Value Comparison */}
                  {!isInitial && (
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Previous Value
                        </span>
                        <span className="font-mono text-red-600 break-words line-through font-medium">
                          {item.previousValue || "(empty)"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          New Value
                        </span>
                        <span className="font-mono text-emerald-700 break-words font-medium">
                          {item.newValue || "(empty)"}
                        </span>
                      </div>
                    </div>
                  )}

                  {isInitial && item.newValue && (
                    <div className="text-xs bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100 text-emerald-900">
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">
                        Initial Payload Recorded
                      </span>
                      <pre className="text-[11px] font-mono whitespace-pre-wrap break-words">
                        {item.newValue}
                      </pre>
                    </div>
                  )}

                  {/* Restore Action Button */}
                  {!isInitial && item.previousValue !== null && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={restoringId === item.id}
                        onClick={() => handleRestore(item.id, item.fieldChanged)}
                        className="text-xs py-1 text-slate-700 hover:text-blue-700 hover:border-blue-300"
                        icon={RotateCcw}
                      >
                        Restore This Version
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};

export default VersionHistoryDrawer;
