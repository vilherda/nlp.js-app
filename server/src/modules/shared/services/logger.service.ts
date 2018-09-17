import * as PrettyError from 'pretty-error';
import { createLogger, format, LoggerInstance, LoggerOptions, transports } from 'winston';

import { settings } from '../settings';

const { combine, timestamp, splat, colorize, label } = format;

export class LoggerService {
  private readonly logger: LoggerInstance;
  private readonly prettyError = new PrettyError();

  constructor(private context: string, transport?) {
    this.logger = createLogger({
      format: this.buildFormat(),
      transports: [
        new transports.Console({
          level: settings.logLevel
        })
      ]
    });
    this.prettyError.skipNodeFiles();
    this.prettyError.skipPackage('express', '@nestjs/common', '@nestjs/core');
  }

  private buildFormat() {
    return combine(
      colorize(),
      label({ label: this.context }),
      timestamp(),
      splat(),
      // eslint-disable arrow-parens
      format.printf(info => {
        return `[${info.timestamp}]-${info.level} (${info.label}): ${info.message}`;
      })
    );
  }

  get Logger(): LoggerInstance {
    return this.logger;
  }

  static configGlobal(options?: LoggerOptions) {
    this.loggerOptions = options;
  }

  log(...message): void {
    const currentDate = new Date();

    this.logger.info(...message, {
      timestamp: currentDate.toISOString(),
      context: this.context
    });
  }

  error(message: string, trace?: any): void {
    const currentDate = new Date();
    const processedTrace = trace instanceof Object ? JSON.stringify(trace, null, 2) : trace;

    this.logger.error(`${message} -> (${processedTrace || 'trace not provided !'})`, {
      timestamp: currentDate.toISOString(),
      context: this.context
    });
  }

  warn(...message): void {
    const currentDate = new Date();
    this.logger.warn(...message, {
      timestamp: currentDate.toISOString(),
      context: this.context
    });
  }

  overrideOptions(options: LoggerOptions) {
    this.logger.configure(options);
  }
}
