export enum LogLevel {
  None = 0,
  Error = 1, // default
  Major = 2,
  Minor = 3,
  Micro = 4,
}

export type LoggerOptions = {
  level: LogLevel;
};

class Logger {
  logLevel = LogLevel.Error;

  constructor(options?: LoggerOptions) {
    if (options?.level) this.logLevel = options.level;
  }

  logError(msg: string): void {
    if (this.logLevel >= LogLevel.Error) console.log(msg);
  }

  logMajor(msg: string): void {
    if (this.logLevel >= LogLevel.Major) console.log(msg);
  }

  logMinor(msg: string): void {
    if (this.logLevel >= LogLevel.Minor) console.log(msg);
  }

  logMicro(msg: string): void {
    if (this.logLevel >= LogLevel.Micro) console.log(msg);
  }
}

export default Logger;
