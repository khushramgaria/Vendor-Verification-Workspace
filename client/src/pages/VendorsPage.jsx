import React, { useState, useEffect, useCallback } from "react";
import VendorList from "../components/vendor/VendorList";
import VendorFormModal from "../components/vendor/VendorFormModal";
import VersionHistoryDrawer from "../components/vendor/VersionHistoryDrawer";
import VendorDetailModal from "../components/vendor/VendorDetailModal";
import apiClient, { API_ENDPOINTS } from "../utils/api";

const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Drawer states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState(null);

  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [selectedVendorIdForHistory, setSelectedVendorIdForHistory] = useState(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVendorForDetail, setSelectedVendorForDetail] = useState(null);

  const fetchVendors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.VENDORS.LIST);
      setVendors(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Handler triggers
  const handleAddNew = () => {
    setVendorToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setVendorToEdit(vendor);
    setIsFormModalOpen(true);
  };

  const handleViewHistory = (vendorId) => {
    setSelectedVendorIdForHistory(vendorId);
    setIsHistoryDrawerOpen(true);
  };

  const handleViewDetails = (vendor) => {
    setSelectedVendorForDetail(vendor);
    setIsDetailModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Vendor Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register new vendors, update credentials, and review compliance audit logs.
          </p>
        </div>
      </div>

      {/* Main Vendor List Component */}
      <VendorList
        vendors={vendors}
        isLoading={isLoading}
        onEdit={handleEdit}
        onViewHistory={handleViewHistory}
        onViewDetails={handleViewDetails}
        onAddNew={handleAddNew}
      />

      {/* Create / Edit Form Modal */}
      <VendorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        vendorToEdit={vendorToEdit}
        onSuccess={fetchVendors}
      />

      {/* Version History Drawer */}
      <VersionHistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        vendorId={selectedVendorIdForHistory}
        onRestored={fetchVendors}
      />

      {/* Vendor Detail View Modal */}
      <VendorDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vendor={selectedVendorForDetail}
        onEdit={handleEdit}
        onViewHistory={handleViewHistory}
        onVendorUpdated={fetchVendors}
      />
    </div>
  );
};

export default VendorsPage;
