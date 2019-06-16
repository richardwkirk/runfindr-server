const express = require('express');

const app = express();

// cors middleware - cross origin support
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/locations', require('./routes/api/locations'));
app.use('/api/countries', require('./routes/api/countries'));
app.use('/api/athletes', require('./routes/api/athletes'));


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));