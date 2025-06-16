require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const router = require('./routes');
const { internalErrorHandler } = require('./middleware/errorHandlers/internalErrorHandler');

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(router);

app.use(internalErrorHandler);

module.exports = app;
