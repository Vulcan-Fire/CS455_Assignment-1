const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

db.connect();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
