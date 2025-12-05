const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./database');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import Performance Modules
const { autoPriority } = require('./middleware/priorityQueue');
const { loadSheddingMiddleware } = require('./middleware/loadShedding');

// Basic Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Performance Middleware (apply early in the chain)
app.use(loadSheddingMiddleware);  // Load shedding first
app.use(autoPriority);            // Then priority queue

// Import Routes
const schoolRoutes = require('./routes/school');
const authRoutes = require('./routes/auth');
const teacherRoutes = require('./routes/teacher');
const parentRoutes = require('./routes/parent');
const superAdminRoutes = require('./routes/superAdmin');
const partnerRoutes = require('./routes/partner');
const performanceRoutes = require('./routes/performance');

// Register Routes
app.use('/api/school', schoolRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/parent', parentRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/performance', performanceRoutes); // Performance monitoring

// Root and Health Check routes
app.get('/', (req, res) => {
    res.json({
        message: 'SchoolDesk API is running!',
        status: 'healthy',
        version: '1.0.0'
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve React Frontend (Production)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                  SchoolDesk Server                        ║
╠═══════════════════════════════════════════════════════════╣
║  Status: Running                                          ║
║  Port: ${PORT}                                           ║
║  Performance Features:                                    ║
║    ✓ Priority Queue System                                ║
║    ✓ Load Shedding                                        ║
║    ✓ Async Job Queue                                      ║
║    ✓ Batch Processing                                     ║
║                                                           ║
║  Monitoring: http://localhost:${PORT}/api/performance/health ║
╚═══════════════════════════════════════════════════════════╝
    `);
});
