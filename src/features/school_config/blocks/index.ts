import Block from "./model";
import blockService from "./service";
import blockController from "./controller";
import blockRepository from "./repository";
import blockValidationSchemas from "./validation";
import blockRoutes from "./routes";
import { BlockInterface, BlockStatistics } from "./interfaces/interfaces";
import {
  BlockBaseDTO,
  BlockDetailDTO,
  BlockSimpleDTO,
  CreateBlockDTO,
  UpdateBlockDTO,
  BlockListQueryParams,
  PaginatedBlockListDTO,
  BlockDTOMapper,
  BlockStatisticsDTO,
} from "./dto";
import { IBlockRepository, IBlockService } from "./interfaces/services";

// Import and initialize associations
import "./model-associations";

export {
  Block,
  blockService,
  blockController,
  blockRepository,
  blockValidationSchemas,
  blockRoutes,
  BlockInterface,
  BlockStatistics,
  BlockBaseDTO,
  BlockDetailDTO,
  BlockSimpleDTO,
  CreateBlockDTO,
  UpdateBlockDTO,
  BlockListQueryParams,
  PaginatedBlockListDTO,
  BlockStatisticsDTO,
  BlockDTOMapper,
  IBlockRepository,
  IBlockService,
};

export default Block;
