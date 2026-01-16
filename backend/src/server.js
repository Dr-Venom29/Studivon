require('dotenv').config();
const express = require('express');
const { connectDB } = require('./db/connection');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
app.use(express.json()); // Allows your app to read JSON data
app.use('/api/tasks', taskRoutes);


const PORT = process.env.PORT || 5000;

// Connect to the Database, then start the server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});

// A simple test route to make sure everything is working
app.get('/test', (req, res) => {
  res.send('Studivon API is live!');
});