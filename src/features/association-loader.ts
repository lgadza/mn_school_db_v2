import fs from "fs";
import path from "path";
import logger from "../common/utils/logging/logger";

/**
 * Tracks association aliases to prevent duplicates
 */
const registeredAliases = new Map<string, string>();

/**
 * Registers an association alias to prevent duplicates
 * Can be exported and used in model files
 */
export const registerAlias = (model: string, alias: string): boolean => {
  const key = `${model}:${alias}`;
  if (registeredAliases.has(key)) {
    logger.warn(
      `Association alias "${alias}" for model "${model}" already used in ${registeredAliases.get(
        key
      )}`
    );
    return false;
  }
  registeredAliases.set(key, new Error().stack || "unknown location");
  return true;
};

/**
 * Dynamically loads all model-associations files from feature directories
 */
const loadAllAssociations = () => {
  try {
    logger.info("Loading feature-specific model associations...");
    const featuresDir = path.join(__dirname);

    // Get all directories inside the features directory
    const featureDirs = fs
      .readdirSync(featuresDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    // Load association files from each feature
    for (const feature of featureDirs) {
      const associationPath = path.join(
        featuresDir,
        feature,
        "model-associations.ts"
      );

      // Check if model-associations.ts exists for this feature
      if (fs.existsSync(associationPath)) {
        logger.debug(`Loading associations for feature: ${feature}`);
        try {
          // Import the association file
          require(associationPath);
        } catch (error) {
          logger.error(
            `Error loading associations for feature ${feature}:`,
            error
          );
          // Continue with other features instead of crashing the application
        }
      }
    }

    logger.info("All feature-specific associations loaded successfully");
  } catch (error) {
    logger.error("Error loading feature-specific associations:", error);
    throw error;
  }
};

export default loadAllAssociations;
