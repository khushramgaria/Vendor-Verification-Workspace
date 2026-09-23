import Router from "express";
import vendorRoutes from "./vendor.route.js";
import documentRoutes from "./document.route.js";
import verificationRoutes from "./verification.route.js"

const router = Router();

router.use("/vendors", vendorRoutes);
router.use("/documents", documentRoutes);
router.use("/verification", verificationRoutes);

router.get("/health", (_, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

export default router;
