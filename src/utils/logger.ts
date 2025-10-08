import { Logger as TsedLogger } from "@tsed/logger";

/**
 * Centralized logging utility for the application
 * Provides consistent logging across all services
 */
export class Logger {
  private static instance: TsedLogger;

  static getInstance(): TsedLogger {
    if (!Logger.instance) {
      Logger.instance = new TsedLogger("PreprVault");
    }
    return Logger.instance;
  }

  static info(message: string, ...args: any[]): void {
    Logger.getInstance().info(message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    Logger.getInstance().warn(message, ...args);
  }

  static error(message: string, ...args: any[]): void {
    Logger.getInstance().error(message, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    Logger.getInstance().debug(message, ...args);
  }

  static trace(message: string, ...args: any[]): void {
    Logger.getInstance().trace(message, ...args);
  }
}
