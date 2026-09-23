import { Router } from "express";
import { upload } from "../middleware/upload.middleware.js";
import {
  uploadAndExtractDocument,
  getDocumentChecklist,
  sendMissingDocumentEmail,
} from "../controllers/document.controller.js";

const router = Router();

router.post(
  "/upload/:vendorId",
  upload.single("file"),
  uploadAndExtractDocument,
);
router.get("/checklist/:vendorId", getDocumentChecklist);
router.post("/send-missing-email/:vendorId", sendMissingDocumentEmail);

export default router;
