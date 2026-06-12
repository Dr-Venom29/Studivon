const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studivon");
let db;

module.exports = {
  connectDB: async () => {
    try {
      await client.connect();
      db = client.db(); 
      console.log("✅ Successfully connected to Studivon local database.");
    } catch (err) {
      console.error("❌ Database connection failed:", err);
      process.exit(1);
    }
  },
  getDb: () => db,
};