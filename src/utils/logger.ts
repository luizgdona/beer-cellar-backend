export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

export class Logger {
  private static formatLog(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const logData = data ? JSON.stringify(data) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${logData}`.trim();
  }

  static info(message: string, data?: unknown) {
    console.log(this.formatLog('info', message, data));
  }

  static error(message: string, error?: unknown) {
    console.error(this.formatLog('error', message, error));
  }

  static warn(message: string, data?: unknown) {
    console.warn(this.formatLog('warn', message, data));
  }

  static debug(message: string, data?: unknown) {
    if (process.env.DEBUG === 'true') {
      console.debug(this.formatLog('debug', message, data));
    }
  }
}
