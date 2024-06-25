const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
//const { MONGODB_URI } = require('./config/database');

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mydatabase", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT, process.env.MONGODB_URI}`));