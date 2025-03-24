import express from "express";
import { Router } from "express";

// Import feature routers
import authRouter from "../../features/auth/routes";
import usersRouter from "../../features/users/routes";
import addressRouter from "../../features/address/routes";
import schoolRouter from "../../features/schools/routes";
import searchRouter from "../../features/search/routes";
import departmentRouter from "../../features/departments/routes";
import teacherRouter from "../../features/teachers/routes";
// Uncomment these as features are implemented
import rbacRouter from "../../features/rbac/routes/roles.route";
import bookRouter from "../../features/library/books/routes";
import bookLoanRouter from "../../features/library/loans/routes";
import rentalRuleRouter from "../../features/library/rules/routes";

const router: Router = express.Router();

// API v1 info endpoint
router.get("/", (req, res) => {
  res.json({
    version: "v1",
    status: "active",
    endpoints: {
      auth: "/auth",
      users: "/users",
      addresses: "/addresses",
      schools: "/schools",
      search: "/search",
      departments: "/departments",
      teachers: "/teachers",
      books: "/books",
      loans: "/loans",
      rentalRules: "/rental-rules",
      // List available endpoints as they are implemented
      // roles: '/rbac/roles',
      demo: "/demo",
    },
  });
});

// Demo route for testing
router.get("/demo", (req, res) => {
  res.json({
    message: "API v1 is working correctly",
    requestId: req.headers["x-request-id"],
    timestamp: new Date().toISOString(),
  });
});

// Register feature routes
router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/addresses", addressRouter);
router.use("/schools", schoolRouter);
router.use("/search", searchRouter);
router.use("/departments", departmentRouter);
router.use("/teachers", teacherRouter);
router.use("/rbac/roles", rbacRouter);
router.use("/books", bookRouter);
router.use("/loans", bookLoanRouter);
router.use("/rental-rules", rentalRuleRouter);

export default router;
