import BookLoan from "./model";
import bookLoanService from "./service";
import bookLoanController from "./controller";
import bookLoanRepository from "./repository";
import bookLoanValidationSchemas from "./validation";
import bookLoanRoutes from "./routes";

import {
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookLoanDTO,
  RenewBookLoanDTO,
  BookLoanListQueryParams,
  PaginatedBookLoanListDTO,
  BookLoanStatsDTO,
  BookLoanDTOMapper,
} from "./dto";

// Import and initialize associations
import defineAssociations from "../model-associations";
defineAssociations();

export {
  BookLoan,
  bookLoanService,
  bookLoanController,
  bookLoanRepository,
  bookLoanValidationSchemas,
  bookLoanRoutes,
  BookLoanDTO,
  CreateBookLoanDTO,
  ReturnBookLoanDTO,
  RenewBookLoanDTO,
  BookLoanListQueryParams,
  PaginatedBookLoanListDTO,
  BookLoanStatsDTO,
  BookLoanDTOMapper,
};

export default BookLoan;
