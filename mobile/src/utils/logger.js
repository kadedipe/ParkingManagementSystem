// ============================================================================
// Logger Utility
// ============================================================================

import { Platform } from 'react-native';
import config from '../../config';

class Logger {
  constructor() {
    this.enabled = config.dev.loggingEnabled;
    this.tags = {
      info: '📘 INFO',
      warn: '⚠️ WARN',
      error: '❌ ERROR',
      debug: '🔍 DEBUG',
    };
  }

  info(message, ...args) {
    if (this.enabled) {
      console.log(`${this.tags.info} ${message}`, ...args);
    }
  }

  warn(message, ...args) {
    if (this.enabled) {
      console.warn(`${this.tags.warn} ${message}`, ...args);
    }
  }

  error(message, ...args) {
    if (this.enabled) {
      console.error(`${this.tags.error} ${message}`, ...args);
    }
  }

  debug(message, ...args) {
    if (this.enabled && __DEV__) {
      console.log(`${this.tags.debug} ${message}`, ...args);
    }
  }

  track(event, properties = {}) {
    if (this.enabled) {
      console.log(`📊 ${event}`, properties);
    }
  }
}

export const logger = new Logger();
export default logger;