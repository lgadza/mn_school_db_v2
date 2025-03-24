import fs from "fs";
import path from "path";
import logger from "../common/utils/logging/logger";
import associationRegistry from "../common/utils/db/AssociationRegistry";

/**
 * Tracks association aliases to prevent duplicates
 * @deprecated Use AssociationRegistry instead
 */
const registeredAliases = new Map<string, string>();

/**
 * Registers an association alias to prevent duplicates
 * @deprecated Use AssociationRegistry instead
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
 * Load all feature-specific associations
 */
const loadAllAssociations = () => {
  logger.info("Loading all model associations...");

  try {
    // First, require all model-associations.ts files to register associations
    requireAllAssociationFiles();

    // Then apply all registered associations in proper order
    associationRegistry.applyAssociations();

    logger.info("Model associations loaded");
  } catch (error) {
    logger.error("Error loading model associations:", error);
    throw error;
  }
};

/**
 * Find and require all model-associations.ts files in feature directories
 */
const requireAllAssociationFiles = () => {
  const featuresDir = path.join(__dirname);
  const processDirectory = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Recursively process subdirectories
        processDirectory(fullPath);
      } else if (entry.isFile() && entry.name === "model-associations.ts") {
        // Found a model-associations.ts file - require it
        try {
          logger.debug(`Loading associations from: ${fullPath}`);
          require(fullPath);
        } catch (error) {
          logger.error(`Error loading associations from ${fullPath}:`, error);
          // Continue loading other files instead of crashing
        }
      }
    }
  };

  processDirectory(featuresDir);
};

export default loadAllAssociations;
