import express from "express";
import { Router } from "express";

// Import feature routers
import authRouter from "../../features/auth/routes";
import usersRouter from "../../features/users/routes";
import addressRouter from "../../features/address/routes";
import schoolRouter from "../../features/schools/routes";
import searchRouter from "../../features/search/routes";
// Uncomment these as features are implemented
import rbacRouter from "../../features/rbac/routes/roles.route";

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
router.use("/rbac/roles", rbacRouter);

export default router;
