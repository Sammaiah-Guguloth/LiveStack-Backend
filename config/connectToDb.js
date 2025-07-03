const mongoose = require("mongoose");

const connectToDB = async () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Connected to MONGO DB");
    })
    .catch((error) => {
      console.log("DB Connection Failed : ", error);
    });
};

module.exports = connectToDB;
