import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { RoleInterface } from "../interfaces";

// For creating a new Role - id, created_at, and updated_at are optional
interface RoleCreationInterface extends Optional<RoleInterface, "id"> {}

class Role
  extends Model<RoleInterface, RoleCreationInterface>
  implements RoleInterface
{
  public id!: string;
  public name!: string;
  public description!: string;

  // Add any custom methods here
  static async findByName(name: string): Promise<Role | null> {
    return await Role.findOne({ where: { name } });
  }
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    description: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "roles",
    sequelize,
    timestamps: true,
    underscored: true,
  }
);

export default Role;
