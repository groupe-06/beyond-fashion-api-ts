"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Beyond Fashion API',
            version: '1.0.0',
            description: 'API documentation for Beyond Fashion - A social platform for fashion enthusiasts and tailors',
            contact: {
                name: 'Beyond Fashion Team',
                email: 'contact@beyondfashion.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: 'https://beyond-fashion-api-ts-8ruc.onrender.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        email: { type: 'string', format: 'email', example: 'marie.diop@example.com' },
                        lastname: { type: 'string', example: 'Diop' },
                        firstname: { type: 'string', example: 'Marie' },
                        phoneNumber: { type: 'string', example: '+221771234568' },
                        gender: { type: 'string', enum: ['MALE', 'FEMALE'], example: 'FEMALE' },
                        address: { type: 'string', example: 'Plateau, Dakar' },
                        photoUrl: { type: 'string', format: 'uri', example: 'https://example.com/photo.jpg' },
                        credit: { type: 'integer', example: 5000 },
                    },
                },
                Post: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        content: { type: 'string', format: 'uri', example: 'https://example.com/image.jpg' },
                        description: { type: 'string', example: 'Beautiful dress for special occasions' },
                        status: { type: 'boolean', example: true },
                        views: { type: 'integer', example: 150 },
                        nbFavorites: { type: 'integer', example: 12 },
                        authorId: { type: 'integer', example: 1 },
                        publishedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Article: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Coton imprimé Wax' },
                        stockQuantity: { type: 'integer', example: 50 },
                        unitPrice: { type: 'number', format: 'float', example: 10.0 },
                        photo: { type: 'string', format: 'uri' },
                        color: { type: 'string', example: 'Multicolore' },
                        userId: { type: 'integer', example: 1 },
                        categoryId: { type: 'integer', example: 1 },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'integer', example: 1 },
                        name: { type: 'string', example: 'Tissus' },
                        image: { type: 'string', format: 'uri' },
                        unitId: { type: 'integer', example: 1 },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'Error message' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.ts', './controllers/*.ts', './config/swagger-annotations.ts'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: 'Beyond Fashion API Docs',
    }));
    // JSON endpoint for the swagger spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
};
exports.setupSwagger = setupSwagger;
exports.default = swaggerSpec;
