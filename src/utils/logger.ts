/**
 * Centralized logging utility for PetTouch application
 * Provides different log levels and proper formatting
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  component?: string;
}

class Logger {
  private logLevel: LogLevel;
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private formatMessage(level: LogLevel, message: string, component?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const componentPrefix = component ? `[${component}]` : '';
    return `${timestamp} ${levelName} ${componentPrefix} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level <= this.logLevel;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    const formattedMessage = this.formatMessage(entry.level, entry.message, entry.component);

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.DEBUG:
        console.log(formattedMessage, entry.data);
        break;
    }
  }

  error(message: string, data?: any, component?: string): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };
    this.logToConsole(entry);
  }

  warn(message: string, data?: any, component?: string): void {
    const entry: LogEntry = {
      level: LogLevel.WARN,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };
    this.logToConsole(entry);
  }

  info(message: string, data?: any, component?: string): void {
    const entry: LogEntry = {
      level: LogLevel.INFO,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };
    this.logToConsole(entry);
  }

  debug(message: string, data?: any, component?: string): void {
    const entry: LogEntry = {
      level: LogLevel.DEBUG,
      message,
      data,
      timestamp: new Date().toISOString(),
      component,
    };
    this.logToConsole(entry);
  }

  // Specialized logging methods for common use cases
  apiCall(method: string, url: string, data?: any): void {
    this.debug(`API ${method} ${url}`, data, 'API');
  }

  apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    const message = `API ${method} ${url} - ${status}`;
    
    if (level === LogLevel.ERROR) {
      this.error(message, data, 'API');
    } else {
      this.debug(message, data, 'API');
    }
  }

  userAction(action: string, data?: any): void {
    this.info(`User action: ${action}`, data, 'USER');
  }

  geolocation(message: string, data?: any): void {
    this.debug(message, data, 'GEOLOCATION');
  }

  nfcScan(message: string, data?: any): void {
    this.info(message, data, 'NFC');
  }

  auth(message: string, data?: any): void {
    this.info(message, data, 'AUTH');
  }

  database(message: string, data?: any): void {
    this.debug(message, data, 'DATABASE');
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for easier migration from console.log
export const log = {
  error: (message: string, data?: any, component?: string) => logger.error(message, data, component),
  warn: (message: string, data?: any, component?: string) => logger.warn(message, data, component),
  info: (message: string, data?: any, component?: string) => logger.info(message, data, component),
  debug: (message: string, data?: any, component?: string) => logger.debug(message, data, component),
};
