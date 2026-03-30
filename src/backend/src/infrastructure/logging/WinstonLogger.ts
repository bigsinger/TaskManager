/**
 * Logger Interface
 */
export interface ILogger {
  error(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  info(message: string, data?: any): void;
  debug(message: string, data?: any): void;
}

/**
 * Winston Logger Implementation
 */
import winston from 'winston';
import path from 'path';

const LOG_LEVEL = process.env['LOG_LEVEL'] || 'info';
const LOG_DIR = process.env['LOG_DIR'] || 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports: any[] = [
  // Console transport
  new winston.transports.Console({
    format: logFormat,
    level: LOG_LEVEL
  })
];

// File transport (ERROR and WARN only)
if (LOG_LEVEL === 'error' || LOG_LEVEL === 'warn') {
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 10485760, // 10MB
      maxFiles: 7, // Keep 7 days
      tailable: true
    })
  );
}

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: logFormat,
  transports,
  exitOnError: false
});

export default logger;
