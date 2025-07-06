/**
 * Optimized Logger Service để giảm lag terminal
 * Batch logs và chỉ output trong development mode
 */
class OptimizedLogger {
  constructor() {
    this.logBuffer = [];
    this.errorBuffer = [];
    this.isDevelopment = __DEV__;
    this.batchSize = 3;
    this.flushInterval = 500; // 500ms
    
    // Auto flush theo interval
    if (this.isDevelopment) {
      setInterval(() => this.flush(), this.flushInterval);
    }
  }

  /**
   * Log thông tin (chỉ trong development)
   * @param {...any} args Arguments để log
   */
  log(...args) {
    if (!this.isDevelopment) return;
    
    this.logBuffer.push({
      type: 'log',
      args,
      timestamp: Date.now()
    });

    if (this.logBuffer.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Log lỗi (luôn hiển thị)
   * @param {...any} args Arguments để log
   */
  error(...args) {
    this.errorBuffer.push({
      type: 'error',
      args,
      timestamp: Date.now()
    });

    if (this.errorBuffer.length >= this.batchSize) {
      this.flushErrors();
    }
  }

  /**
   * Log warning (chỉ trong development)
   * @param {...any} args Arguments để log
   */
  warn(...args) {
    if (!this.isDevelopment) return;
    
    this.logBuffer.push({
      type: 'warn',
      args,
      timestamp: Date.now()
    });

    if (this.logBuffer.length >= this.batchSize) {
      this.flushLogs();
    }
  }

  /**
   * Flush logs batch
   */
  flushLogs() {
    if (this.logBuffer.length === 0) return;

    const logs = this.logBuffer.splice(0, this.batchSize);
    logs.forEach(log => {
      console[log.type](...log.args);
    });
  }

  /**
   * Flush errors batch
   */
  flushErrors() {
    if (this.errorBuffer.length === 0) return;

    const errors = this.errorBuffer.splice(0, this.batchSize);
    errors.forEach(error => {
      console.error(...error.args);
    });
  }

  /**
   * Flush tất cả buffer
   */
  flush() {
    this.flushLogs();
    this.flushErrors();
  }

  /**
   * Clear tất cả buffer
   */
  clear() {
    this.logBuffer = [];
    this.errorBuffer = [];
  }
}

// Export singleton instance
export const logger = new OptimizedLogger();

// Export convenience methods
export const log = (...args) => logger.log(...args);
export const error = (...args) => logger.error(...args);
export const warn = (...args) => logger.warn(...args);
