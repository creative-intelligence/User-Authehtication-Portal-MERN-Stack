const mongoose = require("mongoose");
const DB =process.env.DATABASE

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database Connection Successful");
  })
  .catch((err) => {
    console.error(`Error Connecting to Database ${err}`);
  });