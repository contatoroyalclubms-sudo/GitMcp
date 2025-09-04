/**
 * PRODUCTION ERROR HANDLER
 * Sistema robusto de tratamento de erros para produção
 */

const logger = require('../config/winston');

class ApplicationError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends ApplicationError {
    constructor(message, errors = []) {
        super(message, 400);
        this.errors = errors;
    }
}

class AuthenticationError extends ApplicationError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}

class AuthorizationError extends ApplicationError {
    constructor(message = 'Access denied') {
        super(message, 403);
    }
}

class NotFoundError extends ApplicationError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}

class ConflictError extends ApplicationError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}

class RateLimitError extends ApplicationError {
    constructor(message = 'Too many requests') {
        super(message, 429);
    }
}

class DatabaseError extends ApplicationError {
    constructor(message = 'Database error', originalError = null) {
        super(message, 500);
        this.originalError = originalError;
        this.isOperational = false;
    }
}

class ExternalServiceError extends ApplicationError {
    constructor(service, originalError = null) {
        super(`External service error: ${service}`, 503);
        this.service = service;
        this.originalError = originalError;
    }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let isOperational = err.isOperational !== undefined ? err.isOperational : true;

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation error';
        isOperational = true;
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid ID format';
        isOperational = true;
    } else if (err.name === 'MongoError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
        isOperational = true;
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        isOperational = true;
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        isOperational = true;
    } else if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Validation error';
        isOperational = true;
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Duplicate entry';
        isOperational = true;
    }

    // Log error
    const errorLog = {
        error: {
            message: err.message,
            stack: err.stack,
            statusCode: statusCode,
            isOperational: isOperational
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            headers: req.headers,
            body: req.body,
            params: req.params,
            query: req.query
        },
        user: req.user ? {
            id: req.user.id,
            email: req.user.email
        } : null,
        timestamp: new Date().toISOString()
    };

    // Log based on severity
    if (statusCode >= 500) {
        logger.error('Server Error', errorLog);
    } else if (statusCode >= 400) {
        logger.warn('Client Error', errorLog);
    }

    // Prepare response
    const response = {
        error: {
            message: message,
            statusCode: statusCode,
            timestamp: new Date().toISOString()
        }
    };

    // Add additional information in development
    if (process.env.NODE_ENV === 'development') {
        response.error.stack = err.stack;
        response.error.details = err;
    }

    // Add request ID if available
    if (req.id) {
        response.error.requestId = req.id;
    }

    // Send response
    res.status(statusCode).json(response);

    // Handle non-operational errors
    if (!isOperational) {
        // Log critical error
        logger.error('CRITICAL ERROR - Application may be in unstable state', errorLog);
        
        // In production, consider restarting the process
        if (process.env.NODE_ENV === 'production') {
            // Graceful shutdown
            process.on('uncaughtException', () => {
                logger.error('Uncaught Exception - Shutting down gracefully');
                process.exit(1);
            });
        }
    }
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Not found handler
const notFoundHandler = (req, res) => {
    const error = new NotFoundError('Route');
    
    logger.warn('404 Not Found', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
    });
    
    res.status(404).json({
        error: {
            message: error.message,
            statusCode: 404,
            timestamp: new Date().toISOString()
        }
    });
};

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return next(new ValidationError('Validation failed', errors));
        }

        req.validatedBody = value;
        next();
    };
};

module.exports = {
    ApplicationError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    DatabaseError,
    ExternalServiceError,
    errorHandler,
    asyncHandler,
    notFoundHandler,
    validate
};