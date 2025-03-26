import { Router } from "express";
import projectRoutes from "./project/routes";
import feedbackRoutes from "./feedback/routes";
import fileRoutes from "./files/routes";
import gradeRoutes from "./grades/routes";

const router = Router();

// Main project routes
router.use("/", projectRoutes);

// Sub-feature routes
router.use("/feedback", feedbackRoutes);
router.use("/files", fileRoutes);
router.use("/grades", gradeRoutes);

export default router;
