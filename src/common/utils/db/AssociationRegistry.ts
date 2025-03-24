import { Model, ModelCtor, Association } from "sequelize";
import logger from "../logging/logger";

/**
 * Association types supported by Sequelize
 */
export enum AssociationType {
  HasOne = "HasOne",
  HasMany = "HasMany",
  BelongsTo = "BelongsTo",
  BelongsToMany = "BelongsToMany",
}

/**
 * Interface for storing association metadata
 */
export interface AssociationDefinition {
  sourceModel: ModelCtor<any>;
  targetModel: ModelCtor<any>;
  type: AssociationType;
  as: string;
  foreignKey: string;
  options: any;
  sourceName: string;
  targetName: string;
  ownerModule: string;
  applied: boolean;
}

/**
 * Centralized registry for all model associations
 * Helps prevent duplicate associations and tracks ownership
 */
class AssociationRegistry {
  private associations: AssociationDefinition[] = [];
  private appliedAssociations: Map<string, boolean> = new Map();

  /**
   * Generate a unique key for an association
   */
  private getAssociationKey(
    sourceModel: string,
    targetModel: string,
    as: string
  ): string {
    return `${sourceModel}:${targetModel}:${as}`;
  }

  /**
   * Register a HasOne association
   */
  public registerHasOne(
    sourceModel: ModelCtor<any>,
    targetModel: ModelCtor<any>,
    options: any = {},
    ownerModule: string
  ): void {
    const sourceName = sourceModel.name;
    const targetName = targetModel.name;
    const as = options.as || targetName;
    const foreignKey = options.foreignKey || `${sourceName.toLowerCase()}Id`;

    this.registerAssociation({
      sourceModel,
      targetModel,
      type: AssociationType.HasOne,
      as,
      foreignKey,
      options,
      sourceName,
      targetName,
      ownerModule,
      applied: false,
    });
  }

  /**
   * Register a HasMany association
   */
  public registerHasMany(
    sourceModel: ModelCtor<any>,
    targetModel: ModelCtor<any>,
    options: any = {},
    ownerModule: string
  ): void {
    const sourceName = sourceModel.name;
    const targetName = targetModel.name;
    const as = options.as || `${targetName}s`;
    const foreignKey = options.foreignKey || `${sourceName.toLowerCase()}Id`;

    this.registerAssociation({
      sourceModel,
      targetModel,
      type: AssociationType.HasMany,
      as,
      foreignKey,
      options,
      sourceName,
      targetName,
      ownerModule,
      applied: false,
    });
  }

  /**
   * Register a BelongsTo association
   */
  public registerBelongsTo(
    sourceModel: ModelCtor<any>,
    targetModel: ModelCtor<any>,
    options: any = {},
    ownerModule: string
  ): void {
    const sourceName = sourceModel.name;
    const targetName = targetModel.name;
    const as = options.as || targetName;
    const foreignKey = options.foreignKey || `${targetName.toLowerCase()}Id`;

    this.registerAssociation({
      sourceModel,
      targetModel,
      type: AssociationType.BelongsTo,
      as,
      foreignKey,
      options,
      sourceName,
      targetName,
      ownerModule,
      applied: false,
    });
  }

  /**
   * Register a BelongsToMany association
   */
  public registerBelongsToMany(
    sourceModel: ModelCtor<any>,
    targetModel: ModelCtor<any>,
    options: any = {},
    ownerModule: string
  ): void {
    const sourceName = sourceModel.name;
    const targetName = targetModel.name;
    const as = options.as || `${targetName}s`;

    // BelongsToMany requires a 'through' option
    if (!options.through) {
      throw new Error(
        `'through' option is required for BelongsToMany association from ${sourceName} to ${targetName}`
      );
    }

    this.registerAssociation({
      sourceModel,
      targetModel,
      type: AssociationType.BelongsToMany,
      as,
      foreignKey: options.foreignKey || `${sourceName.toLowerCase()}Id`,
      options,
      sourceName,
      targetName,
      ownerModule,
      applied: false,
    });
  }

  /**
   * Generic method to register any association
   */
  private registerAssociation(definition: AssociationDefinition): void {
    const { sourceName, targetName, as, ownerModule } = definition;
    const key = this.getAssociationKey(sourceName, targetName, as);

    // Check if this association has already been registered
    if (this.appliedAssociations.has(key)) {
      logger.warn(
        `Association already defined: ${sourceName} ${definition.type} ${targetName} as "${as}". ` +
          `Previously defined by module: ${this.getAssociationOwner(
            sourceName,
            targetName,
            as
          )}, ` +
          `now attempted by: ${ownerModule}`
      );
      return;
    }

    // Save the association definition
    this.associations.push(definition);
    this.appliedAssociations.set(key, false);
    logger.debug(
      `Registered ${definition.type} association: ${sourceName} → ${targetName} as "${as}" (${ownerModule})`
    );
  }

  /**
   * Find the module that owns a specific association
   */
  public getAssociationOwner(
    sourceModel: string,
    targetModel: string,
    as: string
  ): string | undefined {
    const association = this.associations.find(
      (a) =>
        a.sourceName === sourceModel &&
        a.targetName === targetModel &&
        a.as === as
    );
    return association?.ownerModule;
  }

  /**
   * Apply all registered associations to models
   */
  public applyAssociations(): void {
    const sortedAssociations = this.getSortedAssociations();

    for (const association of sortedAssociations) {
      try {
        this.applyAssociation(association);
      } catch (error) {
        logger.error(
          `Error applying ${association.type} association from ${association.sourceName} to ${association.targetName}:`,
          error
        );
      }
    }

    logger.info(
      `Applied ${this.associations.filter((a) => a.applied).length} of ${
        this.associations.length
      } model associations`
    );
  }

  /**
   * Sort associations in dependency order
   */
  private getSortedAssociations(): AssociationDefinition[] {
    // Apply BelongsTo associations first since they define the foreign keys
    // Then apply HasOne and HasMany associations
    // Finally apply BelongsToMany associations which depend on junction tables
    return [...this.associations].sort((a, b) => {
      const typeOrder = {
        [AssociationType.BelongsTo]: 1,
        [AssociationType.HasOne]: 2,
        [AssociationType.HasMany]: 3,
        [AssociationType.BelongsToMany]: 4,
      };

      return typeOrder[a.type] - typeOrder[b.type];
    });
  }

  /**
   * Apply a single association
   */
  private applyAssociation(association: AssociationDefinition): void {
    const { sourceModel, targetModel, type, as, options } = association;
    const key = this.getAssociationKey(
      association.sourceName,
      association.targetName,
      as
    );

    // Skip if already applied
    if (this.appliedAssociations.get(key)) {
      return;
    }

    // Apply the association based on its type
    try {
      switch (type) {
        case AssociationType.HasOne:
          sourceModel.hasOne(targetModel, { ...options, as });
          break;
        case AssociationType.HasMany:
          sourceModel.hasMany(targetModel, { ...options, as });
          break;
        case AssociationType.BelongsTo:
          sourceModel.belongsTo(targetModel, { ...options, as });
          break;
        case AssociationType.BelongsToMany:
          sourceModel.belongsToMany(targetModel, { ...options, as });
          break;
      }

      // Mark as applied
      association.applied = true;
      this.appliedAssociations.set(key, true);

      logger.debug(
        `Applied ${type} association: ${association.sourceName} → ${association.targetName} as "${as}"`
      );
    } catch (error) {
      logger.error(
        `Failed to apply association from ${association.sourceName} to ${association.targetName}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all registered associations
   */
  public getAllAssociations(): AssociationDefinition[] {
    return [...this.associations];
  }

  /**
   * Clear the registry (mainly for testing)
   */
  public clear(): void {
    this.associations = [];
    this.appliedAssociations.clear();
  }
}

// Export singleton instance
export const associationRegistry = new AssociationRegistry();
export default associationRegistry;
