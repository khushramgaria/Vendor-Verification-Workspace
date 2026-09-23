import { Router } from "express";
import {
  verifyCompanyExternal,
  updateWorkflowStatus,
  createVendorTask,
  updateTaskStatus,
} from "../controllers/verification.controller.js";

const router = Router();

router.post("/external/:vendorId", verifyCompanyExternal);
router.patch("/status/:vendorId", updateWorkflowStatus);
router.post("/tasks", createVendorTask);
router.patch("/tasks/:taskId/status", updateTaskStatus);

export default router;
