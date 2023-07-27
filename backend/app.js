const dotenv = require("dotenv");
const express = require("express");
const app = express();
const cookieParser = require('cookie-parser')

dotenv.config({ path: "./config.env" });

require("./db/conn");
// const User=require('./model/users')
app.use(express.json());
app.use(cookieParser())

app.use(require("./router/auth.js"));
const PORT = process.env.PORT;

// app.get('/about',middleware,(req,res)=>{
//   // middleware code
//   res.send("About Server")
// })
// app.get('/contact',middleware,(req,res)=>{
//   // middleware code
//   res.send("Contact Server")
// })

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


app.listen(PORT, () => {
  console.log(`server is running on port ${PORT} `);
});

//
