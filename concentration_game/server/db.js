const mongoose = require('mongoose');

const connect = async () => {
  try {
    await mongoose.connect('mongodb+srv://VulcanFire:f5lzU0vHWGUgWfk5@DB.0783j.mongodb.net/?retryWrites=true&w=majority&appName=DB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

module.exports = { connect };
