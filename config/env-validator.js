/**
 * ENVIRONMENT VALIDATOR
 * Valida todas as variáveis de ambiente necessárias
 */

const joi = require('joi');

// Schema de validação
const envSchema = joi.object({
    // Node Environment
    NODE_ENV: joi.string()
        .valid('development', 'test', 'production')
        .default('development'),
    
    PORT: joi.number()
        .port()
        .default(3000),

    // Database
    DB_TYPE: joi.string()
        .valid('sqlite', 'postgres', 'mysql')
        .default('sqlite'),
    
    DB_HOST: joi.when('DB_TYPE', {
        is: 'postgres',
        then: joi.string().required(),
        otherwise: joi.string().default('localhost')
    }),
    
    DB_PORT: joi.when('DB_TYPE', {
        is: 'postgres',
        then: joi.number().port().required(),
        otherwise: joi.number().port().default(5432)
    }),
    
    DB_NAME: joi.when('DB_TYPE', {
        is: 'postgres',
        then: joi.string().required(),
        otherwise: joi.string().default('gitmecp')
    }),
    
    DB_USER: joi.when('DB_TYPE', {
        is: 'postgres',
        then: joi.string().required(),
        otherwise: joi.string().default('postgres')
    }),
    
    DB_PASSWORD: joi.when('DB_TYPE', {
        is: 'postgres',
        then: joi.string().required(),
        otherwise: joi.string().allow('').default('')
    }),
    
    DB_SSL: joi.boolean().default(false),
    
    DB_STORAGE: joi.when('DB_TYPE', {
        is: 'sqlite',
        then: joi.string().default('./database.sqlite'),
        otherwise: joi.string().optional()
    }),

    // JWT
    JWT_SECRET: joi.string()
        .min(32)
        .required()
        .messages({
            'string.min': 'JWT_SECRET must be at least 32 characters long for security',
            'any.required': 'JWT_SECRET is required for authentication'
        }),
    
    JWT_EXPIRES_IN: joi.string()
        .default('24h'),

    // Redis (optional)
    REDIS_URL: joi.string()
        .uri()
        .optional(),
    
    REDIS_PORT: joi.number()
        .port()
        .default(6379),

    // Logging
    LOG_LEVEL: joi.string()
        .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
        .default('info'),

    // Email (optional)
    SMTP_HOST: joi.string()
        .hostname()
        .optional(),
    
    SMTP_PORT: joi.number()
        .port()
        .optional(),
    
    SMTP_USER: joi.string()
        .email()
        .optional(),
    
    SMTP_PASSWORD: joi.string()
        .optional(),

    // Stripe (optional)
    STRIPE_SECRET_KEY: joi.string()
        .optional(),

    // AI (optional)
    ANTHROPIC_API_KEY: joi.string()
        .optional(),

    // Application
    APP_NAME: joi.string()
        .default('GitMcp Enterprise'),
    
    APP_URL: joi.string()
        .uri()
        .default('http://localhost:3000'),
    
    CORS_ORIGIN: joi.string()
        .default('*'),

    // Rate Limiting
    RATE_LIMIT_WINDOW_MS: joi.number()
        .default(15 * 60 * 1000), // 15 minutes
    
    RATE_LIMIT_MAX_REQUESTS: joi.number()
        .default(100),

    // File Upload
    MAX_FILE_SIZE: joi.number()
        .default(10 * 1024 * 1024), // 10MB
    
    ALLOWED_FILE_TYPES: joi.string()
        .default('image/jpeg,image/png,image/gif,application/pdf'),

    // Session
    SESSION_SECRET: joi.string()
        .min(32)
        .default('default-session-secret-change-in-production'),

    // Monitoring
    ENABLE_METRICS: joi.boolean()
        .default(true),
    
    METRICS_PORT: joi.number()
        .port()
        .default(9090)

}).unknown(); // Allow additional environment variables

class EnvironmentValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.config = {};
    }

    validate() {
        console.log('🔍 Validating environment configuration...');
        
        // Validate against schema
        const { error, value } = envSchema.validate(process.env, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            this.errors = error.details.map(detail => ({
                key: detail.context.key,
                message: detail.message
            }));
            
            this.logErrors();
            return false;
        }

        this.config = value;
        
        // Additional validations
        this.performAdditionalChecks();
        
        // Log results
        if (this.errors.length > 0) {
            this.logErrors();
            return false;
        }
        
        if (this.warnings.length > 0) {
            this.logWarnings();
        }
        
        console.log('✅ Environment configuration validated successfully');
        return true;
    }

    performAdditionalChecks() {
        // Check production requirements
        if (process.env.NODE_ENV === 'production') {
            // Ensure strong JWT secret
            if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 64) {
                this.warnings.push('JWT_SECRET should be at least 64 characters in production');
            }
            
            // Ensure database password is set
            if (process.env.DB_TYPE === 'postgres' && !process.env.DB_PASSWORD) {
                this.errors.push({
                    key: 'DB_PASSWORD',
                    message: 'Database password is required in production'
                });
            }
            
            // Check SSL settings
            if (!process.env.DB_SSL) {
                this.warnings.push('Consider enabling DB_SSL in production');
            }
            
            // Check session secret
            if (process.env.SESSION_SECRET === 'default-session-secret-change-in-production') {
                this.errors.push({
                    key: 'SESSION_SECRET',
                    message: 'Default session secret cannot be used in production'
                });
            }
        }
        
        // Check optional services configuration
        if (process.env.SMTP_HOST && (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD)) {
            this.warnings.push('SMTP is configured but credentials are missing');
        }
        
        if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
            this.warnings.push('STRIPE_SECRET_KEY should start with sk_');
        }
    }

    logErrors() {
        console.error('❌ Environment validation failed:');
        this.errors.forEach(error => {
            console.error(`   - ${error.key}: ${error.message}`);
        });
    }

    logWarnings() {
        console.warn('⚠️  Environment warnings:');
        this.warnings.forEach(warning => {
            console.warn(`   - ${warning}`);
        });
    }

    getConfig() {
        return this.config;
    }

    static validateOrExit() {
        const validator = new EnvironmentValidator();
        
        if (!validator.validate()) {
            console.error('\n❌ Please fix the environment configuration errors and try again.');
            process.exit(1);
        }
        
        return validator.getConfig();
    }
}

module.exports = EnvironmentValidator;