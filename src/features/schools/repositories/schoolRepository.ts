// import DBConnectUtil from '@/common/utils/db/dbConnect';
// import { School } from '../types';

// export class SchoolRepository {
//   private static readonly TABLE_NAME = 'schools';

//   /**
//    * Get all schools with optional filtering
//    */
//   public static async findAll(filters?: Record<string, any>): Promise<School[]> {
//     let whereClause = '';
//     const params: any[] = [];

//     if (filters) {
//       const conditions: string[] = [];
//       Object.entries(filters).forEach(([key, value], index) => {
//         conditions.push(`${key} = $${index + 1}`);
//         params.push(value);
//       });

//       if (conditions.length > 0) {
//         whereClause = `WHERE ${conditions.join(' AND ')}`;
//       }
//     }

//     const sql = `SELECT * FROM ${this.TABLE_NAME} ${whereClause} ORDER BY name ASC`;
//     const result = await DBConnectUtil.executeQuery<School>(sql, params);

//     return result.rows;
//   }

//   /**
//    * Find a school by its ID
//    */
//   public static async findById(id: number): Promise<School | null> {
//     return DBConnectUtil.getSingleRow<School>(
//       `SELECT * FROM ${this.TABLE_NAME} WHERE id = $1`,
//       [id]
//     );
//   }

//   /**
//    * Create a new school
//    */
//   public static async create(schoolData: Omit<School, 'id'>): Promise<School> {
//     return DBConnectUtil.insertRecord<School>(this.TABLE_NAME, schoolData);
//   }

//   /**
//    * Update an existing school
//    */
//   public static async update(id: number, schoolData: Partial<School>): Promise<School | null> {
//     return DBConnectUtil.updateRecord<School>(
//       this.TABLE_NAME,
//       schoolData,
//       'id = $1',
//       [id]
//     );
//   }

//   /**
//    * Delete a school by ID
//    */
//   public static async delete(id: number): Promise<boolean> {
//     const result = await DBConnectUtil.executeQuery(
//       `DELETE FROM ${this.TABLE_NAME} WHERE id = $1 RETURNING id`,
//       [id]
//     );

//     return result.rowCount > 0;
//   }

//   /**
//    * Execute a complex operation within a transaction
//    */
//   public static async transferStudents(fromSchoolId: number, toSchoolId: number): Promise<number> {
//     return DBConnectUtil.executeTransaction(async (client) => {
//       // Update students' school_id within a transaction
//       const result = await client.query(
//         'UPDATE students SET school_id = $1 WHERE school_id = $2 RETURNING id',
//         [toSchoolId, fromSchoolId]
//       );

//       return result.rowCount;
//     });
//   }
// }
