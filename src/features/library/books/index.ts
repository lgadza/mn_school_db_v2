import Book from "./model";
import bookService from "./service";
import bookController from "./controller";
import bookRepository from "./repository";
import bookValidationSchemas from "./validation";
import bookRoutes from "./routes";
import {
  BookInterface,
  BookStatus,
  AvailabilityStatus,
  BookLoanInterface,
  BookReviewInterface,
} from "../interfaces/interfaces";
import {
  BookBaseDTO,
  BookDetailDTO,
  BookSimpleDTO,
  CreateBookDTO,
  UpdateBookDTO,
  BookListQueryParams,
  PaginatedBookListDTO,
  BookDTOMapper,
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookDTO,
  BookReviewDTO,
  CreateBookReviewDTO,
} from "./dto";
import { BookLoanDTOMapper } from "../loans/dto"; // Fix: Import from loans dto instead of local dto
import { IBookRepository, IBookService } from "../interfaces/services";
import BookReview from "./book-review.model";
import BookLoan from "../loans/model";

// Import and initialize associations
import defineAssociations from "../model-associations";
defineAssociations();

export {
  Book,
  bookService,
  bookController,
  bookRepository,
  bookValidationSchemas,
  bookRoutes,
  BookInterface,
  BookStatus,
  AvailabilityStatus,
  BookLoanInterface,
  BookReviewInterface,
  BookBaseDTO,
  BookDetailDTO,
  BookSimpleDTO,
  CreateBookDTO,
  UpdateBookDTO,
  BookListQueryParams,
  PaginatedBookListDTO,
  BookDTOMapper,
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookDTO,
  BookReviewDTO,
  CreateBookReviewDTO,
  BookLoanDTOMapper,
  IBookRepository,
  IBookService,
  BookLoan,
  BookReview,
};

export default Book;
