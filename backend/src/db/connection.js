const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGO_URI);
let db;

module.exports = {
  connectDB: async () => {
    try {
      await client.connect();
      // This selects the 'studivon' database from your URI
      db = client.db(); 
      console.log("✅ Successfully connected to Studivon DB on your cluster.");
    } catch (err) {
      console.error("❌ Database connection failed:", err);
      process.exit(1);
    }
  },
  getDb: () => db,
};