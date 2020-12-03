export enum LogLevel {
  none = 0,
  error = 1, // default
  major = 2,
  minor = 3,
  micro = 4,
}

export type LoggerOptions = {
  level: LogLevel;
};

class Logger {
  logLevel = LogLevel.error;

  constructor(options?: LoggerOptions) {
    if (options?.level) this.logLevel = options.level;
  }

  logError(msg: string): void {
    if (this.logLevel >= LogLevel.error) console.log(msg);
  }

  logMajor(msg: string): void {
    if (this.logLevel >= LogLevel.major) console.log(msg);
  }

  logMinor(msg: string): void {
    if (this.logLevel >= LogLevel.minor) console.log(msg);
  }

  logMicro(msg: string): void {
    if (this.logLevel >= LogLevel.micro) console.log(msg);
  }
}

export default Logger;
