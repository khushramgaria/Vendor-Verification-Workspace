import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Badge from "../components/common/Badge";
import Button from "../components/common/Button";
import apiClient, { API_ENDPOINTS } from "../utils/api";

const Dashboard = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await apiClient.get(API_ENDPOINTS.VENDORS.LIST);
        setVendors(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load dashboard vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVendors();
  }, []);

  const totalVendors = vendors.length;
  const underReview = vendors.filter((v) => v.status === "UNDER_REVIEW").length;
  const approved = vendors.filter((v) => v.status === "APPROVED").length;
  const actionRequired = vendors.filter(
    (v) => v.status === "ACTION_REQUIRED",
  ).length;

  const stats = [
    {
      title: "Total Registered Vendors",
      count: totalVendors,
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
    },
    {
      title: "Pending Review",
      count: underReview,
      color: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <Clock className="w-6 h-6 text-sky-600" />,
    },
    {
      title: "Approved Vendors",
      count: approved,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
    },
    {
      title: "Action Required",
      count: actionRequired,
      color: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30 uppercase tracking-wider">
            Workspace Active
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Vendor Verification & Audit Dashboard
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage vendor onboarding, monitor compliance verification, and
            inspect version-controlled history logs in real-time.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link to="/vendors">
              <Button variant="primary" size="md">
                <span>Manage All Vendors</span>
                <ArrowRight className="w-4 h-4 ml-2 inline-block" />
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none">
          <Building2 className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {isLoading ? "..." : stat.count}
              </h3>
            </div>
            <div className={`p-3 rounded-xl border ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Vendors Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Vendors
            </h3>
            <p className="text-xs text-slate-500">
              Latest vendor registrations in your workspace
            </p>
          </div>
          <Link to="/vendors">
            <span className="text-xs font-bold text-blue-600 hover:text-blue-700">
              View All Vendors &rarr;
            </span>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-6">Company</th>
                <th className="py-3 px-6">Contact Person</th>
                <th className="py-3 px-6">GST / Tax ID</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-32"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-24"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-4 bg-slate-200 rounded w-28"></div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                    </td>
                  </tr>
                ))
              ) : vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    No vendors registered yet. Go to Vendors page to add one.
                  </td>
                </tr>
              ) : (
                vendors.slice(0, 5).map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-slate-50/60">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {vendor.companyName}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {vendor.contactPerson}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600">
                      {vendor.taxNumber}
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={vendor.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
