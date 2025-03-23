import swaggerJsdoc from "swagger-jsdoc";

// Define the swagger options type
interface SwaggerOptions {
  definition: {
    openapi: string;
    info: {
      title: string;
      version: string;
      description: string;
    };
    servers: {
      url: string;
      description: string;
    }[];
    components: {
      securitySchemes: {
        bearerAuth: {
          type: string;
          scheme: string;
          bearerFormat: string;
        };
      };
    };
    security: {
      bearerAuth: string[];
    }[];
  };
  apis: string[];
}

const options: SwaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Makronexus School Database API",
      version: "1.0.0",
      description:
        "API documentation for the Makronexus School Database backend",
    },
    servers: [
      {
        url: "/",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/features/**/routes.ts",
    "./src/features/**/controller.ts",
    "./src/features/**/models/*.ts",
    "./src/features/**/*.model.ts",
    "./src/routes/**/*.ts",
    "./src/shared/middleware/*.ts",
  ],
};

const swaggerDocs = swaggerJsdoc(options);

export default swaggerDocs;
