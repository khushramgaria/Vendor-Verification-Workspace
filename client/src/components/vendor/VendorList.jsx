import React, { useState } from "react";
import { Search, Plus, Inbox } from "lucide-react";
import Badge from "../common/Badge";
import Button from "../common/Button";

const VendorList = ({
  vendors = [],
  isLoading = false,
  onEdit,
  onViewHistory,
  onViewDetails,
  onAddNew,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "ALL" || vendor.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Toolbar */}
      <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div className="flex flex-1 items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search company, contact person, email, GST..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ACTION_REQUIRED">Action Required</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {/* Add Vendor CTA */}
        {onAddNew && (
          <Button
            variant="primary"
            onClick={onAddNew}
            icon={Plus}
          >
            Add New Vendor
          </Button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <th className="py-3.5 px-5">Company & ID</th>
              <th className="py-3.5 px-5">Contact Person</th>
              <th className="py-3.5 px-5">Tax / Reg Number</th>
              <th className="py-3.5 px-5">Workflow Status</th>
              <th className="py-3.5 px-5">Verification</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-36 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-28 mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-32"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-4 bg-slate-200 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-5">
                    <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="h-8 bg-slate-200 rounded w-28 ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredVendors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-slate-800">No vendors found</p>
                    <p className="text-xs text-slate-500">
                      {searchTerm || statusFilter !== "ALL"
                        ? "Try clearing filters or search queries."
                        : "Click 'Add New Vendor' to register your first vendor."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-slate-50/80 transition-colors duration-150 group"
                >
                  {/* Company Name & Registration */}
                  <td className="py-4 px-5">
                    <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {vendor.companyName}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      Reg: {vendor.registrationNumber || "N/A"}
                    </div>
                  </td>

                  {/* Contact Person & Email */}
                  <td className="py-4 px-5">
                    <div className="font-medium text-slate-800">
                      {vendor.contactPerson}
                    </div>
                    <div className="text-xs text-slate-500">{vendor.email}</div>
                  </td>

                  {/* GST / Tax Number */}
                  <td className="py-4 px-5 font-mono text-xs text-slate-700">
                    {vendor.taxNumber || "N/A"}
                  </td>

                  {/* Workflow Status */}
                  <td className="py-4 px-5">
                    <Badge status={vendor.status} />
                  </td>

                  {/* External Verification */}
                  <td className="py-4 px-5">
                    <Badge status={vendor.externalVerificationStatus || "PENDING"} />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewDetails(vendor)}
                        className="text-slate-600 hover:text-slate-900"
                        title="View Details"
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(vendor)}
                        className="text-slate-700"
                        title="Edit Vendor"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onViewHistory(vendor.id)}
                        className="bg-slate-800 text-white"
                        title="Version History Audit"
                      >
                        History
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer info bar */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
        <span>Showing {filteredVendors.length} of {vendors.length} vendors</span>
        <span>Version History & Audit Logging Active</span>
      </div>
    </div>
  );
};

export default VendorList;
