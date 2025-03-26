import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { ProspectInterface } from "./interfaces/interfaces";

// Define optional fields for creation
interface ProspectCreationInterface
  extends Optional<
    ProspectInterface,
    "id" | "notes" | "updatedAt" | "createdAt"
  > {}

// Prospect model definition
class Prospect
  extends Model<ProspectInterface, ProspectCreationInterface>
  implements ProspectInterface
{
  public id!: string;
  public userId!: string;
  public schoolId!: string;
  public roleId!: string;
  public addressId!: string;
  public interestLevel!: string;
  public contactDate!: Date;
  public notes!: string | null;
  public activeStatus!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  static async findByUserId(userId: string): Promise<Prospect | null> {
    return await Prospect.findOne({ where: { userId } });
  }
}

Prospect.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "roles",
        key: "id",
      },
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "addresses",
        key: "id",
      },
    },
    interestLevel: {
      type: DataTypes.ENUM("low", "medium", "high"),
      allowNull: false,
      defaultValue: "medium",
    },
    contactDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    activeStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "prospects",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "prospect_userId_idx",
        fields: ["userId"],
      },
      {
        name: "prospect_schoolId_idx",
        fields: ["schoolId"],
      },
      {
        name: "prospect_roleId_idx",
        fields: ["roleId"],
      },
      {
        name: "prospect_addressId_idx",
        fields: ["addressId"],
      },
      {
        name: "prospect_interestLevel_idx",
        fields: ["interestLevel"],
      },
      {
        name: "prospect_status_idx",
        fields: ["activeStatus"],
      },
      {
        name: "prospect_contactDate_idx",
        fields: ["contactDate"],
      },
    ],
  }
);

export default Prospect;
