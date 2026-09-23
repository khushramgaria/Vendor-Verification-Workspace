import { Router } from "express";
import {
  createVendor,
  getAllVendors,
  getVendorById,
  updateVendor,
  restoreVendorVersion,
} from "../controllers/vendor.controller.js";

const router = Router();

router.post("/", createVendor);
router.get("/", getAllVendors);
router.get("/:id", getVendorById);
router.put("/:id", updateVendor);
router.post("/:id/restore/:historyId", restoreVendorVersion);

export default router;
