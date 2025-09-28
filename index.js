const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to HypePass API');
});

const PORT = process.env.PORT || 3000;   
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});