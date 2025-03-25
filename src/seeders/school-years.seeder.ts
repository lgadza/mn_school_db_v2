import SchoolYear from "../features/school_config/school_years/model";
import School from "../features/schools/model";
import logger from "../common/utils/logging/logger";
import { SchoolYearStatus } from "../features/school_config/school_years/interfaces/interfaces";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "sequelize";
import db from "../config/database";

// Helper method to generate an array of academic years starting from a given year
const generateAcademicYears = (
  startYear: number,
  numberOfYears: number
): { year: string; startDate: Date; endDate: Date }[] => {
  const years = [];

  for (let i = 0; i < numberOfYears; i++) {
    const currentStartYear = startYear + i;
    const currentEndYear = currentStartYear + 1;
    const yearString = `${currentStartYear}-${currentEndYear}`;

    // Create standard academic year (Sept 1 to June 30)
    const startDate = new Date(currentStartYear, 8, 1); // September 1st
    const endDate = new Date(currentEndYear, 5, 30); // June 30th

    years.push({
      year: yearString,
      startDate,
      endDate,
    });
  }

  return years;
};

/**
 * Seeds school years into the database for the next 20 years
 * Starting from 2025
 */
export const seedSchoolYears = async (): Promise<void> => {
  let transaction: Transaction | null = null;

  try {
    logger.info("Checking existing school years...");

    // Check if we already have school years in the database
    const existingCount = await SchoolYear.count();

    if (existingCount > 0) {
      logger.info(
        `Found ${existingCount} existing school years. Skipping school year seeding.`
      );
      return;
    }

    // Start a transaction
    transaction = await db.sequelize.transaction();

    // Get all schools
    const schools = await School.findAll({ transaction });

    if (schools.length === 0) {
      logger.info("No schools found. Skipping school year seeding.");
      await transaction.commit();
      return;
    }

    logger.info(`Found ${schools.length} schools. Generating school years...`);

    // Define the starting year and number of years to generate
    const startYear = 2025;
    const numberOfYears = 20;

    // Generate academic years
    const academicYears = generateAcademicYears(startYear, numberOfYears);

    // Create school years for each school
    const schoolYearsToCreate = [];

    for (const school of schools) {
      // Make the first year (2025-2026) active
      const firstYear = {
        ...academicYears[0],
        id: uuidv4(),
        schoolId: school.id,
        status: SchoolYearStatus.ACTIVE,
      };

      // Make subsequent years upcoming
      const remainingYears = academicYears.slice(1).map((year) => ({
        ...year,
        id: uuidv4(),
        schoolId: school.id,
        status: SchoolYearStatus.UPCOMING,
      }));

      schoolYearsToCreate.push(firstYear, ...remainingYears);
    }

    // Bulk create all school years
    await SchoolYear.bulkCreate(schoolYearsToCreate, { transaction });

    logger.info(
      `Successfully created ${schoolYearsToCreate.length} school years for ${schools.length} schools.`
    );

    // Commit the transaction
    await transaction.commit();
    transaction = null;
  } catch (error) {
    // Rollback the transaction in case of error
    if (transaction) await transaction.rollback();

    logger.error("Error seeding school years:", error);
    if (error instanceof Error) {
      logger.error(`Error details: ${error.message}`);
      logger.error(`Stack trace: ${error.stack}`);
    }
  }
};

export default seedSchoolYears;
