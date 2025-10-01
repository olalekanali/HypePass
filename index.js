const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db.config');
const authRoutes = require('./src/routes/Auth.route');
const ticketRoutes = require('./src/routes/Ticket.route');
const eventRoutes = require('./src/routes/Event.route');

dotenv.config();
connectDB();

const app = express();

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to HypePass API');
});

const PORT = process.env.PORT;   
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});