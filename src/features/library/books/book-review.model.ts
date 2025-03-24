import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { BookReviewInterface } from "../interfaces/interfaces";

// Define optional fields for creation
interface BookReviewCreationInterface
  extends Optional<BookReviewInterface, "id" | "review"> {}

// BookReview model definition
class BookReview
  extends Model<BookReviewInterface, BookReviewCreationInterface>
  implements BookReviewInterface
{
  public id!: string;
  public bookId!: string;
  public userId!: string;
  public rating!: number;
  public review!: string | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BookReview.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    bookId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "books",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    review: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "book_reviews",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "book_review_book_id_idx",
        fields: ["bookId"],
      },
      {
        name: "book_review_user_id_idx",
        fields: ["userId"],
      },
      {
        name: "book_review_rating_idx",
        fields: ["rating"],
      },
      {
        // Ensure a user can only review a book once
        name: "book_review_unique_idx",
        unique: true,
        fields: ["bookId", "userId"],
      },
    ],
  }
);

export default BookReview;
