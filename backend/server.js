const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes - All API routes start with /tickets-manager/api
app.use('/tickets-manager/api', require('./routes/auth'));
app.use('/tickets-manager/api', require('./routes/projects'));
app.use('/tickets-manager/api', require('./routes/tickets'));
app.use('/tickets-manager/api', require('./routes/users'));

// Health check
app.get('/tickets-manager/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running' });
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/tickets_db?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
})
.catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/tickets-manager/api`);
});


