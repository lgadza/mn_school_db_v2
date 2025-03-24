import Book from "./books/model";
import BookLoan from "./loans/model";
import BookReview from "./books/book-review.model";
import School from "../schools/model";
import User from "../users/model";
import RentalRule from "./rules/model";

// Define associations
export default function defineAssociations(): void {
  // Books belong to a school
  Book.belongsTo(School, {
    foreignKey: "schoolId",
    as: "school",
  });

  School.hasMany(Book, {
    foreignKey: "schoolId",
    as: "books",
  });

  // Book loans association
  Book.hasMany(BookLoan, {
    foreignKey: "bookId",
    as: "loans",
  });

  BookLoan.belongsTo(Book, {
    foreignKey: "bookId",
    as: "book",
  });

  BookLoan.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(BookLoan, {
    foreignKey: "userId",
    as: "bookLoans",
  });

  // Book reviews association
  Book.hasMany(BookReview, {
    foreignKey: "bookId",
    as: "reviews",
  });

  BookReview.belongsTo(Book, {
    foreignKey: "bookId",
    as: "book",
  });

  BookReview.belongsTo(User, {
    foreignKey: "userId",
    as: "user",
  });

  User.hasMany(BookReview, {
    foreignKey: "userId",
    as: "bookReviews",
  });

  // Rental Rules association
  RentalRule.belongsTo(School, {
    foreignKey: "schoolId",
    as: "school",
  });

  School.hasMany(RentalRule, {
    foreignKey: "schoolId",
    as: "rentalRules",
  });

  // Optional RentalRule-BookLoan association if loans can reference rules
  BookLoan.belongsTo(RentalRule, {
    foreignKey: "rentalRuleId",
    as: "rentalRule",
    constraints: false, // Optional relationship
  });

  RentalRule.hasMany(BookLoan, {
    foreignKey: "rentalRuleId",
    as: "loans",
    constraints: false, // Optional relationship
  });
}
