import express from "express";
import { Router } from "express";

// Import feature routers
import authRouter from "../../features/auth/routes";
import usersRouter from "../../features/users/routes";
import addressRouter from "../../features/address/routes";
import schoolRouter from "../../features/schools/routes";
import searchRouter from "../../features/search/routes";
import departmentRouter from "../../features/school_config/departments/routes";
import gradeRouter from "../../features/school_config/grades/routes";
import sectionRouter from "../../features/school_config/sections/routes";
import categoryRouter from "../../features/school_config/categories/routes";
import blockRouter from "../../features/school_config/blocks/routes";
import classroomRouter from "../../features/school_config/classrooms/routes";
import classRouter from "../../features/school_config/classes/routes";
import teacherRouter from "../../features/teachers/routes";
// Uncomment these as features are implemented
import rbacRouter from "../../features/rbac/routes/roles.route";
import bookRouter from "../../features/library/books/routes";
import bookLoanRouter from "../../features/library/loans/routes";
import rentalRuleRouter from "../../features/library/rules/routes";
import subjectRouter from "../../features/school_config/subjects/routes";
import studentRouter from "../../features/accounts/students/routes";
import behaviorTypeRouter from "../../features/behavior/behavior_types/routes";
import behaviorRouter from "../../features/behavior/behaviors/routes";
import schoolYearRouter from "../../features/school_config/school_years/routes";
import moduleRouter from "../../features/school_config/modules/routes";
import projectRouter from "../../features/projects/routes";
import periodRouter from "../../features/school_config/periods/routes";

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
      grades: "/grades",
      sections: "/sections",
      categories: "/categories",
      blocks: "/blocks",
      classrooms: "/classrooms",
      classes: "/classes",
      teachers: "/teachers",
      books: "/books",
      loans: "/loans",
      rentalRules: "/rental-rules",
      subjects: "/subjects",
      students: "/students",
      behaviorTypes: "/behavior-types",
      behaviors: "/behaviors",
      schoolYears: "/school-years",
      modules: "/modules",
      projects: "/projects",
      periods: "/periods",
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
router.use("/grades", gradeRouter);
router.use("/sections", sectionRouter);
router.use("/categories", categoryRouter);
router.use("/blocks", blockRouter);
router.use("/classrooms", classroomRouter);
router.use("/classes", classRouter);
router.use("/teachers", teacherRouter);
router.use("/rbac/roles", rbacRouter);
router.use("/books", bookRouter);
router.use("/loans", bookLoanRouter);
router.use("/rental-rules", rentalRuleRouter);
router.use("/subjects", subjectRouter);
router.use("/students", studentRouter);
router.use("/behavior-types", behaviorTypeRouter);
router.use("/behaviors", behaviorRouter);
router.use("/school-years", schoolYearRouter);
router.use("/modules", moduleRouter);
router.use("/projects", projectRouter);
router.use("/periods", periodRouter);

export default router;
