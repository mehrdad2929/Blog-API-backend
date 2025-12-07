require('@dotenvx/dotenvx').config();
const express = require('express')
const path = require('path');
const appRouter = require('./routes/appRoutes');
const { setUser } = require('./middewares/auth')
const prisma = require('./db/prisma');
const app = express()

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/', appRouter)
app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.statusCode || 500).send(err.message);
});
const PORT = 3000;
app.listen(PORT, (error) => {
    if (error) {
        throw error;
    }
    console.log(`my app - listening on port ${PORT}!`);
});
module.exports = app;
