import { Router } from "express";
import { studentRoutes } from "./students";
import { teacherRoutes } from "./teachers";

// Create accounts feature router
const accountsRouter = Router();

// Register student routes
accountsRouter.use("/students", studentRoutes);

// Register teacher routes
accountsRouter.use("/teachers", teacherRoutes);

export { accountsRouter };
