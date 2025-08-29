/**
 * @fileoverview Performance monitoring utilities for the S.I.M.A application
 * Provides request timing, database query monitoring, and performance metrics
 * @author S.I.M.A Development Team
 * @version 1.0.0
 */

/**
 * Performance metrics storage
 * @type {Object}
 */
const metrics = {
  requests: [],
  dbQueries: [],
  errors: [],
};

/**
 * Request performance middleware
 * Tracks request timing and response sizes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function requestTimer(req, res, next) {
  const startTime = Date.now();
  const startMemory = process.memoryUsage();
  
  // Override res.end to capture metrics
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage();
    
    const metric = {
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      duration,
      memoryDelta: {
        rss: endMemory.rss - startMemory.rss,
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      },
      timestamp: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    };
    
    // Store metric (keep only last 1000 requests)
    metrics.requests.unshift(metric);
    if (metrics.requests.length > 1000) {
      metrics.requests.pop();
    }
    
    // Log slow requests
    if (duration > 1000) { // > 1 second
      const logger = require('./logger');
      logger.warn({
        slowRequest: metric,
        duration: `${duration}ms`
      }, 'Slow request detected');
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
}

/**
 * Database query performance wrapper
 * Wraps Knex queries to track performance
 * @param {Object} knex - Knex instance
 * @returns {Object} - Wrapped Knex instance
 */
function wrapDatabaseQueries(knex) {
  // Intercept database queries
  knex.on('query', (queryData) => {
    queryData.startTime = Date.now();
  });
  
  knex.on('query-response', (response, queryData) => {
    const duration = Date.now() - queryData.startTime;
    
    const metric = {
      sql: queryData.sql,
      bindings: queryData.bindings,
      duration,
      timestamp: new Date().toISOString(),
      method: queryData.method,
    };
    
    // Store metric (keep only last 500 queries)
    metrics.dbQueries.unshift(metric);
    if (metrics.dbQueries.length > 500) {
      metrics.dbQueries.pop();
    }
    
    // Log slow queries
    if (duration > 500) { // > 500ms
      const logger = require('./logger');
      logger.warn({
        slowQuery: metric,
        duration: `${duration}ms`
      }, 'Slow database query detected');
    }
  });
  
  knex.on('query-error', (error, queryData) => {
    const duration = Date.now() - queryData.startTime;
    
    const errorMetric = {
      sql: queryData.sql,
      bindings: queryData.bindings,
      error: error.message,
      duration,
      timestamp: new Date().toISOString(),
      method: queryData.method,
    };
    
    metrics.errors.unshift(errorMetric);
    if (metrics.errors.length > 100) {
      metrics.errors.pop();
    }
  });
  
  return knex;
}

/**
 * Gets performance statistics
 * @param {number} timeWindow - Time window in minutes (default: 30)
 * @returns {Object} - Performance statistics
 */
function getPerformanceStats(timeWindow = 30) {
  const cutoffTime = new Date(Date.now() - timeWindow * 60 * 1000);
  
  // Filter recent requests
  const recentRequests = metrics.requests.filter(
    req => new Date(req.timestamp) > cutoffTime
  );
  
  // Filter recent queries
  const recentQueries = metrics.dbQueries.filter(
    query => new Date(query.timestamp) > cutoffTime
  );
  
  // Calculate request stats
  const requestStats = {
    total: recentRequests.length,
    averageResponseTime: recentRequests.length > 0 
      ? Math.round(recentRequests.reduce((sum, req) => sum + req.duration, 0) / recentRequests.length)
      : 0,
    slowRequests: recentRequests.filter(req => req.duration > 1000).length,
    errorRate: recentRequests.length > 0
      ? Math.round((recentRequests.filter(req => req.statusCode >= 400).length / recentRequests.length) * 100)
      : 0,
    statusCodes: recentRequests.reduce((acc, req) => {
      acc[req.statusCode] = (acc[req.statusCode] || 0) + 1;
      return acc;
    }, {}),
  };
  
  // Calculate database stats
  const dbStats = {
    totalQueries: recentQueries.length,
    averageQueryTime: recentQueries.length > 0
      ? Math.round(recentQueries.reduce((sum, query) => sum + query.duration, 0) / recentQueries.length)
      : 0,
    slowQueries: recentQueries.filter(query => query.duration > 500).length,
    queryErrors: metrics.errors.filter(
      error => new Date(error.timestamp) > cutoffTime
    ).length,
  };
  
  // System stats
  const memUsage = process.memoryUsage();
  const systemStats = {
    uptime: Math.round(process.uptime()),
    memory: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
    cpu: process.cpuUsage(),
  };
  
  return {
    timeWindow: `${timeWindow} minutes`,
    timestamp: new Date().toISOString(),
    requests: requestStats,
    database: dbStats,
    system: systemStats,
  };
}

/**
 * Gets detailed request metrics
 * @param {number} limit - Maximum number of requests to return
 * @returns {Array} - Recent request metrics
 */
function getRequestMetrics(limit = 50) {
  return metrics.requests.slice(0, limit);
}

/**
 * Gets detailed database query metrics
 * @param {number} limit - Maximum number of queries to return
 * @returns {Array} - Recent query metrics
 */
function getQueryMetrics(limit = 50) {
  return metrics.dbQueries.slice(0, limit);
}

/**
 * Gets error metrics
 * @param {number} limit - Maximum number of errors to return
 * @returns {Array} - Recent error metrics
 */
function getErrorMetrics(limit = 20) {
  return metrics.errors.slice(0, limit);
}

/**
 * Clears all performance metrics
 */
function clearMetrics() {
  metrics.requests = [];
  metrics.dbQueries = [];
  metrics.errors = [];
}

/**
 * Health check function that includes performance metrics
 * @returns {Object} - Health status with performance data
 */
function getHealthWithPerformance() {
  const stats = getPerformanceStats(5); // Last 5 minutes
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: stats.system.uptime,
    performance: {
      avgResponseTime: stats.requests.averageResponseTime,
      avgQueryTime: stats.database.averageQueryTime,
      errorRate: stats.requests.errorRate,
      memoryUsage: stats.system.memory.heapUsed,
    },
  };
  
  // Determine health status based on metrics
  if (stats.requests.averageResponseTime > 2000) {
    health.status = 'degraded';
    health.issues = (health.issues || []).concat('High response times');
  }
  
  if (stats.database.averageQueryTime > 1000) {
    health.status = 'degraded';
    health.issues = (health.issues || []).concat('Slow database queries');
  }
  
  if (stats.requests.errorRate > 10) {
    health.status = 'unhealthy';
    health.issues = (health.issues || []).concat('High error rate');
  }
  
  if (stats.system.memory.heapUsed > 500) { // > 500MB
    health.status = 'degraded';
    health.issues = (health.issues || []).concat('High memory usage');
  }
  
  return health;
}

module.exports = {
  requestTimer,
  wrapDatabaseQueries,
  getPerformanceStats,
  getRequestMetrics,
  getQueryMetrics,
  getErrorMetrics,
  clearMetrics,
  getHealthWithPerformance,
};