/**
 * WINSTON LOGGER CONFIGURATION
 * Sistema de logging estruturado para produção
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

// Definir níveis customizados
const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        verbose: 4,
        debug: 5,
        silly: 6
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        verbose: 'cyan',
        debug: 'blue',
        silly: 'gray'
    }
};

// Formato customizado para logs
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
);

// Formato para console (desenvolvimento)
const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} ${level}: ${message} ${metaString}`;
    })
);

// Configuração de transports
const transports = [];

// Console Transport (sempre ativo)
if (process.env.NODE_ENV !== 'test') {
    transports.push(
        new winston.transports.Console({
            format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
            level: process.env.LOG_LEVEL || 'debug'
        })
    );
}

// File Transport - Erros
transports.push(
    new DailyRotateFile({
        filename: path.join('logs', 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: logFormat
    })
);

// File Transport - Todos os logs
transports.push(
    new DailyRotateFile({
        filename: path.join('logs', 'combined-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: logFormat,
        level: process.env.LOG_LEVEL || 'info'
    })
);

// File Transport - HTTP requests
transports.push(
    new DailyRotateFile({
        filename: path.join('logs', 'http-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d',
        level: 'http',
        format: logFormat
    })
);

// Criar logger
const logger = winston.createLogger({
    levels: customLevels.levels,
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: transports,
    exitOnError: false,
    silent: process.env.NODE_ENV === 'test'
});

// Adicionar cores ao winston
winston.addColors(customLevels.colors);

// Stream para Morgan (HTTP logging)
logger.stream = {
    write: function(message, encoding) {
        logger.http(message.trim());
    }
};

// Métodos auxiliares
logger.logRequest = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        responseTime: `${responseTime}ms`,
        ip: req.ip,
        userAgent: req.get('user-agent')
    };
    
    if (res.statusCode >= 500) {
        logger.error('Server Error', logData);
    } else if (res.statusCode >= 400) {
        logger.warn('Client Error', logData);
    } else {
        logger.http('Request', logData);
    }
};

logger.logError = (error, req = null) => {
    const errorData = {
        message: error.message,
        stack: error.stack,
        name: error.name,
        code: error.code
    };
    
    if (req) {
        errorData.request = {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userId: req.user?.id
        };
    }
    
    logger.error('Application Error', errorData);
};

logger.logDatabase = (query, duration) => {
    logger.verbose('Database Query', {
        query: query,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
    });
};

logger.logCache = (operation, key, hit = false) => {
    logger.debug('Cache Operation', {
        operation: operation,
        key: key,
        hit: hit,
        timestamp: new Date().toISOString()
    });
};

logger.logSecurity = (event, details) => {
    logger.warn('Security Event', {
        event: event,
        details: details,
        timestamp: new Date().toISOString()
    });
};

logger.logPerformance = (metric, value, unit = 'ms') => {
    logger.info('Performance Metric', {
        metric: metric,
        value: value,
        unit: unit,
        timestamp: new Date().toISOString()
    });
};

// Tratamento de exceções não capturadas
if (process.env.NODE_ENV === 'production') {
    logger.exceptions.handle(
        new DailyRotateFile({
            filename: path.join('logs', 'exceptions-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    );
    
    logger.rejections.handle(
        new DailyRotateFile({
            filename: path.join('logs', 'rejections-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    );
}

// Log de inicialização
logger.info('Logger initialized', {
    environment: process.env.NODE_ENV,
    logLevel: logger.level,
    transports: transports.length
});

module.exports = logger;