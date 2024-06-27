require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const connectDb = async () => {
  try{
    await mongoose.connect(
      MONGODB_URI,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    ).then(() => console.log("Database Connected"))
    .catch((err) => console.log("mongodb Connection Error", err));
  }catch{
    (err) => console.log(err);
  }
}
module.exports = { connectDb, MONGODB_URI };