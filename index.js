const express = require('express');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
var routess = require('./routes/route');
app.use('/route',routess);
app.listen(port);
