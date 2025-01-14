import winston from "winston";

const { timestamp, json, combine, colorize, printf } = winston.format;
// check if its in production or not
const isProd = process.env.NODE_ENV === "production";
// Custom console format for better readability
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  const meta = Object.keys(metadata).length ? JSON.stringify(metadata) : "";
  return `${timestamp} ${level}: ${message} ${meta}`;
});

// Create transport based on environment
const createTransports = (filename) => {
  if (isProd) {
    return [new winston.transports.Console()];
  }
  return [
    new winston.transports.File({ filename: filename }),
    new winston.transports.Console({
      format: combine(colorize(), consoleFormat),
    }),
  ];
};

// Info logger
const infoLogger = winston.createLogger({
  level: "info",
  format: combine(timestamp(), json()),
  transports: createTransports("logs/info.log"),
});

// Error logger
const errorLogger = winston.createLogger({
  level: "error",
  format: combine(timestamp(), json()),
  transports: createTransports("logs/error.log"),
  exceptionHandlers: isProd
    ? [new winston.transports.Console()]
    : [
        new winston.transports.File({ filename: "logs/exception.log" }),
        new winston.transports.Console({
          format: combine(colorize(), consoleFormat),
        }),
      ],
  rejectionHandlers: isProd
    ? [new winston.transports.Console()]
    : [
        new winston.transports.File({ filename: "logs/rejections.log" }),
        new winston.transports.Console({
          format: combine(colorize(), consoleFormat),
        }),
      ],
});

// HTTP logger
const httpLogger = winston.createLogger({
  level: "http",
  format: combine(timestamp(), json()),
  transports: createTransports("logs/http.log"),
});

//  usage function
const logMessage = (logger, message, metadata = {}) => {
  const environment = isProd ? "production" : "development";
  logger.log({
    level: logger.level,
    message,
    environment,
    metadata,
  });
};

export { infoLogger, errorLogger, httpLogger, logMessage };
