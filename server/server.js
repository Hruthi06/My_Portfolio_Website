require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const certificateRoutes = require('./routes/certificates');
const experienceRoutes = require('./routes/experience');
const contactRoutes = require('./routes/contact');

app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/contact', contactRoutes);

// Static files for frontend
app.use(express.static(path.join(__dirname, '../client')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
