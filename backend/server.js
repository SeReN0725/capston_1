const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const aiRoutes = require('./routes/aiRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS origins from env
const allowedOriginsCsv = process.env.CORS_ORIGINS || 'http://localhost:5173';
const allowedOrigins = allowedOriginsCsv
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true); // allow tools without Origin header
      const ok = allowedOrigins.includes(origin);
      cb(null, ok);
    },
  })
);
app.use(express.json());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: Number(process.env.RATE_LIMIT) || 60 }));

// Mount API routes
app.use('/api', aiRoutes);

// Static serving in production (same-origin)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});