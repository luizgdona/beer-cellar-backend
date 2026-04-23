export type LogLevel = 'info' | 'error' | 'warn' | 'debug';

export class Logger {
  private static formatLog(level: LogLevel, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logData = data ? JSON.stringify(data) : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message} ${logData}`.trim();
  }

  static info(message: string, data?: any) {
    console.log(this.formatLog('info', message, data));
  }

  static error(message: string, error?: any) {
    console.error(this.formatLog('error', message, error));
  }

  static warn(message: string, data?: any) {
    console.warn(this.formatLog('warn', message, data));
  }

  static debug(message: string, data?: any) {
    if (process.env.DEBUG === 'true') {
      console.debug(this.formatLog('debug', message, data));
    }
  }
}
