import prisma from "../config/db.config.js";

export const createVendor = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      email,
      phone,
      address,
      registrationNumber,
      taxNumber,
      bankAccountNumber,
      ifscCode,
    } = req.body;

    const vendor = await prisma.vendor.create({
      data: {
        companyName,
        contactPerson,
        email,
        phone,
        address,
        registrationNumber,
        taxNumber,
        bankAccountNumber,
        ifscCode,
        history: {
          create: {
            version: 1,
            fieldChanged: "INITIAL_CREATION",
            previousValue: null,
            newValue: JSON.stringify({
              companyName,
              registrationNumber,
              taxNumber,
            }),
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    console.error("Error creating vendor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllVendors = async (req, res) => {
  try {
    const vendors = await prisma.vendor.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        documents: true,
        tasks: true,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Vendors fetched successfully",
      data: vendors,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getVendorById = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        history: { orderBy: { createdAt: "desc" } },
        documents: true,
        tasks: { orderBy: { dueDate: "asc" } },
      },
    });

    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Vendor fetched successfully",
      data: vendor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingVendor = await prisma.vendor.findUnique({
      where: { id },
      include: { history: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!existingVendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const currentVersion = existingVendor.history[0]?.version || 1;
    const nextVersion = currentVersion + 1;

    const changedFields = [];
    Object.keys(updateData).forEach((key) => {
      if (
        existingVendor[key] !== undefined &&
        existingVendor[key] !== updateData[key]
      ) {
        changedFields.push({
          field: key,
          oldValue: String(existingVendor[key]),
          newValue: String(updateData[key]),
        });
      }
    });

    const updatedVendor = await prisma.$transaction(async (tx) => {
      if (changedFields.length > 0) {
        for (const change of changedFields) {
          await tx.vendorHistory.create({
            data: {
              vendorId: id,
              version: nextVersion,
              fieldChanged: change.field,
              previousValue: change.oldValue,
              newValue: change.newValue,
            },
          });
        }
      }

      return await tx.vendor.update({
        where: { id },
        data: updateData,
      });
    });

    return res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    console.error("Error updating vendor:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreVendorVersion = async (req, res) => {
  try {
    const { id, historyId } = req.params;

    const historyRecord = await prisma.vendorHistory.findUnique({
      where: { id: historyId },
    });

    if (!historyRecord || historyRecord.vendorId !== id) {
      return res
        .status(404)
        .json({ success: false, message: "History record not found" });
    }

    const restoredVendor = await prisma.vendor.update({
      where: { id },
      data: {
        [historyRecord.fieldChanged]: historyRecord.previousValue,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Restored ${historyRecord.fieldChanged} to previous version successfully`,
      data: restoredVendor,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
