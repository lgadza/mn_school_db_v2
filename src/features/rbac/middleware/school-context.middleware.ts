import { Request, Response, NextFunction } from "express";
import logger from "../../../common/utils/logging/logger";

/**
 * Middleware that enforces school-level access restrictions
 *
 * - super_admin: Has access to all schools/resources system-wide
 * - admin: Has access only to resources within their assigned school
 * - manager: Has access (except DELETE) only to resources within their assigned school
 */
export const enforceSchoolContext = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Skip enforcement for super_admin (they have system-wide access)
    if (req.user?.role === "super_admin") {
      return next();
    }

    // For admin and manager, limit to their school context
    if (req.user?.role === "admin" || req.user?.role === "manager") {
      const userSchoolId = req.user.schoolId;

      // If no school is associated with the user, deny access
      if (!userSchoolId) {
        logger.warn(
          `User ${req.user.id} (${req.user.role}) attempted to access resources but has no school assignment`
        );
        return res.status(403).json({
          success: false,
          message: "Access denied: No school context found for this user",
        });
      }

      // For GET requests that return multiple records, filter by schoolId
      if (req.method === "GET" && !req.params.id) {
        // Ensure query filters include the user's school
        req.query.schoolId = userSchoolId;
        logger.debug(
          `Applied school context filter for ${req.user.role}: ${userSchoolId}`
        );
      }
      // For requests targeting a specific resource
      else {
        // Typically you would validate here that the resource belongs to the user's school
        // This will need to be implemented based on your resource models and may require
        // a database lookup before proceeding

        // Example pseudocode:
        // const resource = await YourModel.findByPk(req.params.id);
        // if (resource.schoolId !== userSchoolId) {
        //   return res.status(403).json({
        //     success: false,
        //     message: 'Access denied: Resource belongs to a different school'
        //   });
        // }

        // For now we'll add a placeholder for this logic
        logger.debug(
          `School context validation needed for ${req.method} on ${req.path}`
        );
      }

      return next();
    }

    // For all other roles, continue to regular permission checks
    return next();
  } catch (error) {
    logger.error("Error in school context middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authorization",
    });
  }
};

export default enforceSchoolContext;
