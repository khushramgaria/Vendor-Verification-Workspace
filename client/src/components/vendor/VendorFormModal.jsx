import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Receipt,
  CreditCard,
  Landmark,
  ShieldCheck,
  PlusCircle,
  FileEdit,
} from "lucide-react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import apiClient, { API_ENDPOINTS } from "../../utils/api";

const VendorFormModal = ({
  isOpen,
  onClose,
  vendorToEdit = null,
  onSuccess,
}) => {
  const isEditing = Boolean(vendorToEdit);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      address: "",
      registrationNumber: "",
      taxNumber: "",
      bankAccountNumber: "",
      ifscCode: "",
      status: "DRAFT",
    },
  });

  useEffect(() => {
    if (vendorToEdit) {
      reset({
        companyName: vendorToEdit.companyName || "",
        contactPerson: vendorToEdit.contactPerson || "",
        email: vendorToEdit.email || "",
        phone: vendorToEdit.phone || "",
        address: vendorToEdit.address || "",
        registrationNumber: vendorToEdit.registrationNumber || "",
        taxNumber: vendorToEdit.taxNumber || "",
        bankAccountNumber: vendorToEdit.bankAccountNumber || "",
        ifscCode: vendorToEdit.ifscCode || "",
        status: vendorToEdit.status || "DRAFT",
      });
    } else {
      reset({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        address: "",
        registrationNumber: "",
        taxNumber: "",
        bankAccountNumber: "",
        ifscCode: "",
        status: "DRAFT",
      });
    }
  }, [vendorToEdit, reset, isOpen]);

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await apiClient.put(
          API_ENDPOINTS.VENDORS.UPDATE(vendorToEdit.id),
          data
        );
        toast.success("Vendor updated successfully");
      } else {
        await apiClient.post(API_ENDPOINTS.VENDORS.CREATE, data);
        toast.success("Vendor registered successfully");
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save vendor:", error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Vendor Details" : "Register New Vendor"}
      subtitle={
        isEditing
          ? "Modifying vendor attributes automatically logs a version audit record."
          : "Complete the fields below to onboard a new vendor into your workspace."
      }
      icon={isEditing ? FileEdit : PlusCircle}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section 1: Company & Primary Contact */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Company & Contact Profile
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="e.g. Acme Global Logistics Ltd."
              required
              icon={Building2}
              error={errors.companyName}
              {...register("companyName", {
                required: "Company name is required",
              })}
            />

            <Input
              label="Contact Person"
              placeholder="e.g. Jane Smith"
              required
              icon={User}
              error={errors.contactPerson}
              {...register("contactPerson", {
                required: "Contact person is required",
              })}
            />
          </div>
        </div>

        {/* Section 2: Communication & Address */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Mail className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Contact & Location
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="e.g. vendor@acme.com"
              required
              icon={Mail}
              error={errors.email}
              {...register("email", {
                required: "Email address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address format",
                },
              })}
            />

            <Input
              label="Phone Number"
              placeholder="e.g. +1 555-019-2834"
              required
              icon={Phone}
              error={errors.phone}
              {...register("phone", { required: "Phone number is required" })}
            />
          </div>

          <div className="w-full flex flex-col space-y-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Registered Address <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative rounded-lg group">
              <div className="absolute top-3 left-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-600 transition-colors">
                <MapPin className="h-4 w-4 shrink-0" />
              </div>
              <textarea
                rows={2}
                placeholder="e.g. 100 Corporate Parkway, Suite 400, New York, NY 10001"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 text-sm font-semibold border rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 ${
                  errors.address
                    ? "border-red-500 bg-red-50/30 focus:ring-red-500/20 focus:border-red-600"
                    : "border-slate-300 hover:border-slate-400"
                }`}
                {...register("address", { required: "Address is required" })}
              />
            </div>
            {errors.address && (
              <p className="text-xs text-red-600 font-bold mt-1">
                {errors.address.message}
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Legal & Tax Registration */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <FileText className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Legal & Tax Credentials
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Registration Number"
              placeholder="e.g. REG-894812"
              required
              icon={FileText}
              error={errors.registrationNumber}
              {...register("registrationNumber", {
                required: "Registration number is required",
              })}
            />

            <Input
              label="GST / Tax ID Number"
              placeholder="e.g. 27AAAAA0000A1Z5"
              required
              icon={Receipt}
              error={errors.taxNumber}
              {...register("taxNumber", {
                required: "Tax ID / GST is required",
              })}
            />
          </div>
        </div>

        {/* Section 4: Banking Information */}
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Landmark className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Banking & Settlement Details
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Bank Account Number"
              placeholder="e.g. 987654321012"
              required
              icon={CreditCard}
              error={errors.bankAccountNumber}
              {...register("bankAccountNumber", {
                required: "Bank account number is required",
              })}
            />

            <Input
              label="IFSC Code"
              placeholder="e.g. HDFC0000123"
              required
              icon={Landmark}
              error={errors.ifscCode}
              {...register("ifscCode", { required: "IFSC code is required" })}
            />
          </div>
        </div>

        {/* Editing Status Option */}
        {isEditing && (
          <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 pb-1">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Workflow Status
              </label>
            </div>
            <select
              className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-sm font-semibold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 cursor-pointer"
              {...register("status")}
            >
              <option value="DRAFT">Draft</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ACTION_REQUIRED">Action Required</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? "Save Changes" : "Create Vendor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VendorFormModal;
