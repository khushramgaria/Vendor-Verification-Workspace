import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { Resend } from "resend";
import prisma from "../config/db.config.js";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to convert local file to Gemini inline Part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}

export const uploadAndExtractDocument = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { docType } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No document file uploaded" });
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);
    const prompt = `
      Extract key business details from this vendor document image. 
      Return ONLY a raw JSON object with these exact keys (use null if not found):
      {
        "companyName": string | null,
        "registrationNumber": string | null,
        "taxNumber": string | null,
        "address": string | null,
        "bankAccountNumber": string | null,
        "ifscCode": string | null
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [prompt, imagePart],
    });

    let extractedData = {};
    try {
      const cleanedJsonText = response.text.replace(/```json|```/g, "").trim();
      extractedData = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      console.warn(
        "Could not parse clean JSON from Gemini output:",
        response.text,
      );
    }

    let mismatchFound = false;
    let mismatchDetails = [];

    if (
      extractedData.companyName &&
      extractedData.companyName.toLowerCase().trim() !==
        vendor.companyName.toLowerCase().trim()
    ) {
      mismatchFound = true;
      mismatchDetails.push(
        `Company Name mismatch: Found "\({extractedData.companyName}" vs Saved "\){vendor.companyName}"`,
      );
    }

    if (
      extractedData.taxNumber &&
      extractedData.taxNumber !== vendor.taxNumber
    ) {
      mismatchFound = true;
      mismatchDetails.push(
        `Tax/GST ID mismatch: Found "\({extractedData.taxNumber}" vs Saved "\){vendor.taxNumber}"`,
      );
    }

    const savedDoc = await prisma.document.create({
      data: {
        vendorId,
        docType,
        fileUrl: req.file.path,
        fileName: req.file.originalname,
        extractedData,
        mismatchFound,
        mismatchDetails: mismatchDetails.join(" | "),
        checklistStatus: "VERIFIED",
      },
    });

    if (mismatchFound) {
      await prisma.vendor.update({
        where: { id: vendorId },
        data: { status: "ACTION_REQUIRED" },
      });
    }

    return res.status(200).json({
      success: true,
      data: savedDoc,
      extractedData,
      mismatchFound,
      mismatchDetails,
    });
  } catch (error) {
    console.error("Error extracting document:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDocumentChecklist = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const documents = await prisma.document.findMany({
      where: { vendorId },
    });

    const requiredTypes = [
      "REGISTRATION_CERTIFICATE",
      "GST_TAX_CERTIFICATE",
      "BANK_DOCUMENT",
    ];
    const checklist = requiredTypes.map((type) => {
      const foundDoc = documents.find((doc) => doc.docType === type);
      return {
        type,
        status: foundDoc ? foundDoc.checklistStatus : "MISSING",
        document: foundDoc || null,
      };
    });

    return res.status(200).json({ success: true, data: checklist });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const sendMissingDocumentEmail = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const { missingDocType } = req.body;

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    if (!vendor) {
      return res
        .status(404)
        .json({ success: false, message: "Vendor not found" });
    }

    const emailResult = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [vendor.email],
      subject: `Action Required: Missing Document Request for ${vendor.companyName}`,
      html: `
      Document Request: ${vendor.companyName}
        Dear ${vendor.contactPerson},

        During our automated compliance audit, we noticed that your mandatory document (${missingDocType.replace(/_/g, " ")}) is currently missing or needs re-submission.

        Please reply to this email or upload the document to complete your verification process.


        Best regards,


        Compliance & Verification Team
        `,
    });

    await prisma.vendor.update({
      where: { id: vendorId },
      data: { status: "ACTION_REQUIRED" },
    });

    return res.status(200).json({
      success: true,
      message: `Missing document email successfully sent to ${vendor.email}`,
      data: emailResult,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
