require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const articleRoutes = require('./routes/articleRoute');
const userRoutes = require('./routes/userRoutes');
const { connectDb } = require('./config/database');

const app = express();
app.use(express.json());

// mongoose.connect("mongodb://localhost:27017/mydatabase", { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((err) => console.error('MongoDB connection error:', err));
connectDb();
app.use('/api/users', authRoutes);
app.use('/api', userRoutes)
app.use('/api/articles', articleRoutes)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));