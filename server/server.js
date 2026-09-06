const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const BypassService = require('./services/bypass');
const { services } = require('./services/catalog');

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting - More generous limits
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    success: false,
    error: 'Too many requests. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stats tracking
let stats = {
  totalBypassed: 23387799,
  successCount: 0,
  failureCount: 0,
  serviceStats: {},
  uptime: Date.now()
};

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    uptime: Math.floor((Date.now() - stats.uptime) / 1000),
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

/**
 * Get stats endpoint
 */
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    stats: {
      total: stats.totalBypassed,
      success: stats.successCount,
      failure: stats.failureCount,
      successRate: stats.successCount > 0 
        ? ((stats.successCount / (stats.successCount + stats.failureCount)) * 100).toFixed(2) + '%'
        : '0%',
      services: stats.serviceStats,
      uptime: Math.floor((Date.now() - stats.uptime) / 1000)
    }
  });
});

/**
 * Main bypass endpoint
 */
app.post('/api/bypass', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    console.log(`[BYPASS] Processing: ${url}`);

    // Perform bypass
    const result = await BypassService.bypass(url);

    // Update stats
    if (result.success) {
      stats.totalBypassed++;
      stats.successCount++;
      stats.serviceStats[result.service] = (stats.serviceStats[result.service] || 0) + 1;
      console.log(`[SUCCESS] ${result.service}: ${result.destination}`);
    } else {
      stats.failureCount++;
      console.log(`[FAILURE] ${result.error}`);
    }

    res.json(result);

  } catch (error) {
    console.error('[ERROR]', error);
    stats.failureCount++;
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Bulk bypass endpoint (requires API key)
 */
app.post('/api/bypass/bulk', async (req, res) => {
  try {
    const { urls, apiKey } = req.body;

    // Validate API key
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or missing API key'
      });
    }

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'URLs array is required'
      });
    }

    if (urls.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 URLs per request'
      });
    }

    console.log(`[BULK] Processing ${urls.length} URLs`);

    // Process all URLs
    const results = await Promise.all(
      urls.map(url => BypassService.bypass(url))
    );

    // Update stats
    results.forEach(result => {
      if (result.success) {
        stats.totalBypassed++;
        stats.successCount++;
        stats.serviceStats[result.service] = (stats.serviceStats[result.service] || 0) + 1;
      } else {
        stats.failureCount++;
      }
    });

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`[BULK] Complete: ${successful} success, ${failed} failed`);

    res.json({
      success: true,
      results: results,
      total: results.length,
      successful: successful,
      failed: failed,
      successRate: ((successful / results.length) * 100).toFixed(2) + '%'
    });

  } catch (error) {
    console.error('[BULK ERROR]', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * Get supported services
 */
app.get('/api/supported', (req, res) => {
  res.json({
    success: true,
    services,
    total: services.length,
    categories: [...new Set(services.map((service) => service.category))]
  });
});

/**
 * Test endpoint
 */
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log('========================================');
  console.log('   🚀 EVO BYPASS SERVER');
  console.log('========================================');
  console.log(`   Port: ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API: http://localhost:${PORT}/api`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
  console.log('   Server is ready!');
  console.log('========================================\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n[SHUTDOWN] Received SIGTERM signal');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Received SIGINT signal');
  process.exit(0);
});

module.exports = app;
