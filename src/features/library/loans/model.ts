import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "@/config/sequelize";
import { BookLoanInterface } from "../books";

// Define optional fields for creation
interface BookLoanCreationInterface
  extends Optional<BookLoanInterface, "id" | "returnDate" | "status"> {}

// BookLoan model definition
class BookLoan
  extends Model<BookLoanInterface, BookLoanCreationInterface>
  implements BookLoanInterface
{
  public id!: string;
  public bookId!: string;
  public userId!: string;
  public rentalDate!: Date;
  public dueDate!: Date;
  public returnDate!: Date | null;
  public status!: "active" | "returned" | "overdue";
  public notes!: string | null;
  public lateFee?: number | null;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Helper methods
  public isOverdue(): boolean {
    if (this.returnDate) return false;
    return new Date() > this.dueDate;
  }

  public getDaysOverdue(): number {
    if (this.returnDate || !this.isOverdue()) return 0;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - this.dueDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

BookLoan.init(
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
    lateFee: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    rentalDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "returned", "overdue"),
      allowNull: false,
      defaultValue: "active",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "book_loans",
    sequelize,
    timestamps: true,
    indexes: [
      {
        name: "book_loan_book_id_idx",
        fields: ["bookId"],
      },
      {
        name: "book_loan_user_id_idx",
        fields: ["userId"],
      },
      {
        name: "book_loan_status_idx",
        fields: ["status"],
      },
      {
        name: "book_loan_due_date_idx",
        fields: ["dueDate"],
      },
    ],
  }
);

export default BookLoan;
