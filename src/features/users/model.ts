import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { UserInterface } from "./interfaces";
import bcrypt from "bcrypt";

interface UserCreationInterface
  extends Optional<
    UserInterface,
    | "id"
    | "lastLogin"
    | "avatar"
    | "gender"
    | "passwordResetToken"
    | "passwordResetExpires"
    | "dateOfBirth"
    | "email"
  > {}

interface UserAttributes extends Omit<UserInterface, "verifyPassword"> {
  schoolId?: string;
  countryCode?: string | null;
}

class User
  extends Model<UserAttributes, UserCreationInterface>
  implements UserInterface
{
  public id!: string;
  public username!: string;
  public email!: string | null;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public isActive!: boolean;
  public lastLogin?: Date;
  public avatar?: string | null;
  public schoolId?: string | undefined;
  public gender?: string | null;
  public passwordResetToken?: string | null;
  public passwordResetExpires?: Date | null;
  public dateOfBirth?: Date | null;
  public countryCode?: string | null;
  public phoneNumber!: string;

  // Custom instance methods
  public async verifyPassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Static methods
  static async findByUsername(username: string): Promise<User | null> {
    return await User.findOne({ where: { username } });
  }

  static async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    username: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: new DataTypes.STRING(255),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: new DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    lastName: {
      type: new DataTypes.STRING(50),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "schools",
        key: "id",
      },
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    countryCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    tableName: "users",
    sequelize,
    timestamps: true,
    underscored: true,
    hooks: {
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed("password")) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
