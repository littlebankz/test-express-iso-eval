require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authentication = require('./routes/authentication.js');

const app = express();

const corsOptions = {
    origin: 'http://localhost:8080'
}

app.use(cors(corsOptions))
app.use(bodyParser.json())

app.use('/api/login', authentication)

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running is ${process.env.NODE_ENV} mode on port ${process.env.PORT}`));