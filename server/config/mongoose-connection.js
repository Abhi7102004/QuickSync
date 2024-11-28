const mongoose = require("mongoose");
const dbUrl = process.env.MONGODB_URL;
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Db connected");
  })
  .catch((err) => {
    console.log(err.message);
  });
module.exports = mongoose.connection;
