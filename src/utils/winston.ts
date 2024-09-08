import { createLogger, format, transports } from "winston";

export const WinstonInstance = createLogger({
  exitOnError: false,
  transports: [
    new transports.File({ filename: "logs/warn.log", level: "warn" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/crit.log", level: "crit" }),
    new transports.Console({
      format: format.printf(
        ({ level, message }) =>
          `[${level}] ${new Date().toISOString()} [ADMIN-SERVER] - ${message}`
      ),
    }),
  ],
  format: format.printf(
    ({ level, message }) =>
      `[${level}] ${new Date().toISOString()} [ADMIN-SERVER] - ${message}`
  ),
});
