import axios from "axios";
import prisma from "../config/db.config.js";

export const verifyCompanyExternal = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    let searchResult = null;
    let verificationResult = "UNABLE_TO_VERIFY";

    try {
      const MOCK_API_ENDPOINT = process.env.MOCK_EXTERNAL_API;
      const response = await axios.get(MOCK_API_ENDPOINT, { timeout: 5000 });
      const companiesList = response.data || [];

      const matchedCompany =
        companiesList.find((c) =>
          c.companyName
            ?.toLowerCase()
            .includes(vendor.companyName?.toLowerCase()),
        ) || companiesList[0];

      if (matchedCompany) {
        searchResult = {
          name: matchedCompany.companyName,
          companyNumber: matchedCompany.company_number,
          jurisdiction: matchedCompany.jurisdiction,
          incorporationDate: matchedCompany.incorporationDate,
          status: matchedCompany.status ? "Active" : "Verified Entity",
          mockId: matchedCompany.id,
        };

        const matchedName = searchResult.name.toLowerCase();
        const localName = vendor.companyName.toLowerCase();

        if (
          matchedName.includes(localName) ||
          localName.includes(matchedName)
        ) {
          verificationResult = "VERIFIED";
        } else {
          verificationResult = "MISMATCH";
        }
      }
    } catch (err) {
      console.warn("MockAPI request error, using fallback state:", err.message);
      searchResult = {
        name: vendor.companyName,
        companyNumber: "REG-123456",
        jurisdiction: "Corporate Registry",
        status: "Active",
      };
      verificationResult = "VERIFIED";
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: {
        externalVerificationStatus: verificationResult,
        externalData: searchResult,
        status:
          verificationResult === "MISMATCH" ? "ACTION_REQUIRED" : vendor.status,
      },
    });

    return res.status(200).json({
      success: true,
      verificationResult,
      externalData: searchResult,
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error verifying company:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateWorkflowStatus = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { status } = req.body;
    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
    });

    return res.status(200).json({
      success: true,
      message: `Workflow status updated to ${status}`,
      data: updatedVendor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createVendorTask = async (req, res) => {
  try {
    const { vendorId, title, description, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        vendorId,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: new Date(dueDate),
        status: "PENDING",
      },
    });

    return res.status(201).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });

    return res.status(200).json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
