require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

connectDB().then(() => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`electrically backend running on port ${PORT}`);
    });
}).catch(err => {
    console.error('DB connection failed', err);
    process.exit(1);
});
