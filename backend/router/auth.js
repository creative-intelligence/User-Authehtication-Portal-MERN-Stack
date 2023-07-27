const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");

const User = require("../model/users");

router.get("/", (req, res) => {
  res.send("Hello World");
});

// Post Method Using Promises

// router.post("/register", (req, res) => {
//   const {name,email,phone,work,password,cpassword}=req.body;

// //   checking user ne kisi field ko empty to nai chora
// // ye kam user schema k andr  ho skta hy required true kr k
//   if(!name ||!email|| !phone ||!work || password!== cpassword){
//     return res.status(422).res.json({error:"Please enter valid data"})
//   }
//   User.findOne({email:email})
//   .then((userExist)=>{
//     if(userExist){
//         return res.status(422).json({"message":"Email already exist!"})
//   }
//   const user=new User({
//     name,email,phone,work,password,cpassword
//   })
//   user.save().then(()=>{
//     res.status(201).json({message:"user registered successffully"})

//   }).catch((err)=>res.status(500).json({error:"failed to registered"}))
// });
// })

// Post Method Using Async Await

router.post("/register", async (req, res) => {
  const { name, email, phone, work, password, cpassword } = req.body;

  //   checking user ne kisi field ko empty to nai chora
  // ye kam user schema k andr  ho skta hy required true kr k
  if (!name || !email || !phone || !work || !password || !cpassword) {
    return res.status(422).json({ error: "Please fill the fields properly" });
  }

  try {
    const userExist = await User.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ message: "Email already exist!" });
    } else if (password != cpassword) {
      return res.status(422).json({ Error: "Passwords do not match." });
    } else {
      const user = new User({ name, email, phone, work, password, cpassword });

      // jo data user enter kr raha hy usko get krny k bad
      // aur us data ko save krny se pehly hmen password ko
      // hash krna pryga database mein save krny se pehly

      const registeredUser = await user.save();
      res.status(201).json({ message: "user registered successffully" });
    }
  } catch (err) {
    console.log(err);
  }
});
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Please fill in the required fields" });
    }

    const userLogin = await User.findOne({ email: email });
    if (!userLogin) {
      return res.status(400).json({ error: "Invalid email credentials" });
    }

    const isMatch = await bcrypt.compare(password, userLogin.password);

    //   Generating a jwt token to authenticate and authorise user

    const token = await userLogin.generateAuthToken();
    console.log(token);

    // method to store our token in cookie
    // it takes two parameters
    // cookie name, token whcih we are generating
    // timelimit for the cookie when to expire
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 25892000000), // Set cookie expiration time (1 day in this example)
      httpOnly: true, // Ensure the cookie is only accessible via HTTP(S)
      secure: false, // Set to true if using HTTPS
    });

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid password credentials" });
    }

    res.json({ message: "Signin successful" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Get User Data for  About Us Page

router.get("/about", authenticate, (req, res) => {
  // middleware code
  console.log("My About");
  res.send(req.rootUser);
});

//Get User Data for  Contact Us Page
router.get("/getdata", authenticate, (req, res) => {
  // middleware code
  console.log("My Contact");
  res.send(req.rootUser);
});

router.post("/contact", authenticate, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: "Please fill all fields" });
    }
    const userContact = await User.findOne({_id:req.userID})
    if(userContact){
      const userMessage=await userContact.addMessage(name,email,phone,message)
      await userContact.save();
      res.status(201).json({message:"user contact information successfully added in DB"})
    }
    
  } catch (err) {
    console.log(err);
  }
});


// Logout Page 

router.get("/logout",(req, res) => {
  // middleware code
  console.log("Hello from my logout Page");
  res.clearCookie('jwtoken',{path:'/'})
  res.status(200).send("User Logout");
});

module.exports = router;
