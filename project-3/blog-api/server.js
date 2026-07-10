const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // parse incoming JSON request bodies
app.use(express.static(path.join(__dirname, 'public'))); // serve the frontend

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Connect to DB, sync models (creates tables if they don't exist), then start server
sequelize.sync().then(() => {
  console.log('Database connected and synced.');
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to connect to database:', err);
});
