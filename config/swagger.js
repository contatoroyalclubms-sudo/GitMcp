/**
 * SWAGGER API DOCUMENTATION
 * Documentação completa da API GitMcp
 */

const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'GitMcp Enterprise API',
        version: '2.0.0',
        description: 'Sistema completo de gestão empresarial com PDV, eventos, BI e IA',
        termsOfService: 'https://gitmecp.com/terms',
        contact: {
            name: 'API Support',
            email: 'api@gitmecp.com',
            url: 'https://gitmecp.com/support'
        },
        license: {
            name: 'Proprietary',
            url: 'https://gitmecp.com/license'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        },
        {
            url: 'https://api.gitmecp.com',
            description: 'Production server'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token'
            }
        },
        schemas: {
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Error message'
                    },
                    code: {
                        type: 'string',
                        description: 'Error code'
                    },
                    details: {
                        type: 'object',
                        description: 'Additional error details'
                    }
                }
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['admin', 'manager', 'operator'] },
                    active: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Event: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    venue: { type: 'string' },
                    capacity: { type: 'integer' },
                    status: { type: 'string', enum: ['planning', 'active', 'completed', 'cancelled'] },
                    revenue: { type: 'number', format: 'decimal' },
                    ticketsSold: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Product: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    category: { type: 'string' },
                    price: { type: 'number', format: 'decimal' },
                    cost: { type: 'number', format: 'decimal' },
                    stock: { type: 'integer' },
                    minStock: { type: 'integer' },
                    barcode: { type: 'string' },
                    active: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Sale: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    eventId: { type: 'string', format: 'uuid' },
                    clientId: { type: 'string', format: 'uuid' },
                    userId: { type: 'string', format: 'uuid' },
                    total: { type: 'number', format: 'decimal' },
                    discount: { type: 'number', format: 'decimal' },
                    paymentMethod: { 
                        type: 'string', 
                        enum: ['cash', 'credit_card', 'debit_card', 'pix', 'cashless'] 
                    },
                    status: { 
                        type: 'string', 
                        enum: ['pending', 'completed', 'cancelled', 'refunded'] 
                    },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string', format: 'uuid' },
                                quantity: { type: 'integer' },
                                unitPrice: { type: 'number', format: 'decimal' },
                                total: { type: 'number', format: 'decimal' }
                            }
                        }
                    },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Client: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    name: { type: 'string' },
                    document: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    category: { 
                        type: 'string', 
                        enum: ['Standard', 'Premium', 'VIP'] 
                    },
                    cashlessBalance: { type: 'number', format: 'decimal' },
                    loyaltyPoints: { type: 'integer' },
                    npsScore: { type: 'integer', minimum: 0, maximum: 10 },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            }
        },
        responses: {
            UnauthorizedError: {
                description: 'Access token is missing or invalid',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            NotFoundError: {
                description: 'The specified resource was not found',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            },
            ValidationError: {
                description: 'Validation error',
                content: {
                    'application/json': {
                        schema: {
                            $ref: '#/components/schemas/Error'
                        }
                    }
                }
            }
        }
    },
    security: [{
        bearerAuth: []
    }],
    tags: [
        {
            name: 'Authentication',
            description: 'User authentication endpoints'
        },
        {
            name: 'Dashboard',
            description: 'Dashboard and analytics endpoints'
        },
        {
            name: 'Events',
            description: 'Event management endpoints'
        },
        {
            name: 'PDV',
            description: 'Point of sale endpoints'
        },
        {
            name: 'Inventory',
            description: 'Inventory control endpoints'
        },
        {
            name: 'Sales',
            description: 'Sales management endpoints'
        },
        {
            name: 'Clients',
            description: 'Client management endpoints'
        },
        {
            name: 'Products',
            description: 'Product and menu management endpoints'
        },
        {
            name: 'Finance',
            description: 'Financial control endpoints'
        },
        {
            name: 'Reports',
            description: 'Reports and export endpoints'
        },
        {
            name: 'Marketing',
            description: 'Marketing campaigns endpoints'
        },
        {
            name: 'Cashless',
            description: 'Cashless system endpoints'
        },
        {
            name: 'Team',
            description: 'Team management endpoints'
        },
        {
            name: 'Config',
            description: 'System configuration endpoints'
        },
        {
            name: 'AI',
            description: 'AI and predictions endpoints'
        },
        {
            name: 'Health',
            description: 'System health and monitoring endpoints'
        }
    ]
};

const options = {
    definition: swaggerDefinition,
    apis: [
        './routes/*.js',
        './routes/**/*.js'
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;