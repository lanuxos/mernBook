const mongoose = require('mongoose');

module.exports = async function connectDB() {
    const uri = process.env.MONGO_URI || ''; // fill in .env
    if (!uri) throw new Error('MONGO_URI not set in .env');
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('MongoDB connected');
};
