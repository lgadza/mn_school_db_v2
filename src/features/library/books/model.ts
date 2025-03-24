import { Model, DataTypes, Optional, Op } from "sequelize";
import sequelize from "@/config/sequelize";
import { BookInterface, BookStatus } from "../interfaces/interfaces";
import School from "../../schools/model";

// Define optional fields for creation (fields with default values or generated values like ID)
interface BookCreationInterface
  extends Optional<
    BookInterface,
    | "id"
    | "available"
    | "copiesAvailable"
    | "copiesTotal"
    | "language"
    | "status"
  > {}

// Book model definition
class Book
  extends Model<
    Omit<BookInterface, "isAvailable" | "getAvailabilitySummary">,
    BookCreationInterface
  >
  implements BookInterface
{
  public id!: string;
  public title!: string;
  public genre!: string;
  public available!: boolean;
  public publishYear!: string | null;
  public author!: string | null;
  public coverUrl!: string | null;
  public description!: string | null;
  public copiesAvailable!: number;
  public copiesTotal!: number;
  public isbn!: string | null;
  public schoolId!: string;
  public publisher!: string | null;
  public language!: string;
  public pageCount!: number | null;
  public deweyDecimal!: string | null;
  public tags!: string[] | null;
  public status!: BookStatus;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isAvailable(): boolean {
    return (
      this.available &&
      this.copiesAvailable > 0 &&
      this.status === BookStatus.ACTIVE
    );
  }

  public getAvailabilitySummary(): string {
    return `${this.copiesAvailable} of ${this.copiesTotal} copies available`;
  }
}

Book.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: new DataTypes.STRING(200),
      allowNull: false,
    },
    genre: {
      type: new DataTypes.STRING(100),
      allowNull: false,
    },
    available: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    publishYear: {
      type: new DataTypes.STRING(4),
      allowNull: true,
    },
    author: {
      type: new DataTypes.STRING(200),
      allowNull: true,
    },
    coverUrl: {
      type: new DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    copiesAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    copiesTotal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    isbn: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "schools",
        key: "id",
      },
    },
    publisher: {
      type: new DataTypes.STRING(200),
      allowNull: true,
    },
    language: {
      type: new DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "English",
    },
    pageCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deweyDecimal: {
      type: new DataTypes.STRING(20),
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    status: {
      type: new DataTypes.ENUM(...Object.values(BookStatus)),
      allowNull: false,
      defaultValue: BookStatus.ACTIVE,
    },
  },
  {
    tableName: "books",
    sequelize,
    timestamps: true,
    indexes: [
      {
        // Index for ISBN searches
        name: "book_isbn_school_idx",
        unique: true,
        fields: ["isbn", "schoolId"],
        where: {
          isbn: {
            [Op.ne]: null,
          },
        },
      },
      {
        // Index for school searches
        name: "book_school_id_idx",
        fields: ["schoolId"],
      },
      {
        // Index for genre searches
        name: "book_genre_idx",
        fields: ["genre"],
      },
      {
        // Index for title searches
        name: "book_title_idx",
        fields: ["title"],
      },
      {
        // Index for author searches
        name: "book_author_idx",
        fields: ["author"],
      },
      {
        // Index for status searches
        name: "book_status_idx",
        fields: ["status"],
      },
      {
        // Index for availability searches
        name: "book_availability_idx",
        fields: ["available", "copiesAvailable"],
      },
    ],
  }
);

// Define book-school relationship
Book.belongsTo(School, {
  foreignKey: "schoolId",
  as: "school",
});

export default Book;
