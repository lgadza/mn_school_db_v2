import { Request, Response } from "express";
import DBConnectUtil from "@/common/utils/db/dbConnect";
import logger from "@/common/utils/logging/logger";

export class StudentController {
  /**
   * Get students with advanced filtering
   */
  public static async getStudents(req: Request, res: Response) {
    try {
      const {
        grade,
        school_id,
        limit = 20,
        offset = 0,
        sort_by = "last_name",
        sort_dir = "ASC",
      } = req.query;

      let whereClause = "";
      const params: any[] = [];
      const conditions: string[] = [];

      // Build where clause from filters
      if (grade) {
        conditions.push(`grade = $${params.length + 1}`);
        params.push(grade);
      }

      if (school_id) {
        conditions.push(`school_id = $${params.length + 1}`);
        params.push(school_id);
      }

      if (conditions.length > 0) {
        whereClause = `WHERE ${conditions.join(" AND ")}`;
      }

      // Safely handle sort direction
      const direction = ["ASC", "DESC"].includes(String(sort_dir).toUpperCase())
        ? String(sort_dir).toUpperCase()
        : "ASC";

      // Execute paginated query with metrics and timeout protection
      const sql = `
        SELECT * FROM students 
        ${whereClause} 
        ORDER BY ${sort_by} ${direction}
        LIMIT $${params.length + 1} OFFSET $${params.length + 2}
      `;

      params.push(limit, offset);

      const result = await DBConnectUtil.executeQuery(sql, params, {
        timeout: 10000, // 10 second timeout for this query
      });

      // Get total count for pagination
      const countResult = await DBConnectUtil.countRecords(
        "students",
        conditions.join(" AND "),
        params.slice(0, conditions.length)
      );

      res.json({
        data: result.rows,
        pagination: {
          total: countResult,
          limit: Number(limit),
          offset: Number(offset),
          pages: Math.ceil(countResult / Number(limit)),
        },
      });
    } catch (error) {
      logger.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  }
}
