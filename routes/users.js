var express = require('express');
var router = express.Router();

const mongoose = require("mongoose");
const User = require("../models/user.model.js");
const path = require("path");
const bcrypt = require("bcrypt");

//   ./user/

/* GET users listing. */

router.get("/",(req,res)=>{
  if(req.session.user_id){
    return res.status(200).json({
      path:"./home.html"
    });
  }
  else{
    return res.status(200).json({
      path:"./login.html"
    });
  }
});

router.get('/logout', (req, res) => {
  if(req.session.user_id){
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Failed to logout');
        }
    });
  }
  res.redirect('/');
});

router.post('/forgotback', (req, res) => {
  if (req.session.user_id !== undefined) {
    return res.status(200).json({path:'home.html'});
  } else {
    return res.status(200).json({path:'/'});
    }
});

router.post('/login', async function(req, res) {
  try{
    const {username,password} = req.body;
    
    if(!username || !password){
      return res.sendStatus(401);
    }
    
    const this_user = await User.findOne({username});
    if(!this_user){
      return res.sendStatus(401);
    }

    const isMatch = await bcrypt.compare(password,this_user.password);
    if(!isMatch){
      return res.sendStatus(401);
    }

    req.session.user_id = this_user._id;
    res.sendStatus(200)

  }catch(err){
      console.log(err);
      res.status(500).json({message:"server error"});
  }
});

router.post('/register', async function(req, res) {
  try{
    const {username,password,email} = req.body;
    
    if(!username || !password || !email){
      return res.status(401).send({message:"Insert your credintials"});
    }
    
    const this_user = await User.findOne({username});
    if(this_user){
      return res.status(409).json({
        message:"Username already taken"
      });
    }

    const hashedPass = await bcrypt.hash(password,10);
    const newUser = new User({
      username,
      password: hashedPass,
      email
    });

    const user = await newUser.save();

    req.session.user_id = user._id;

    res.sendStatus(201);

  }catch(err){
      console.log(err);
      res.status(500).json({message:"server error"});
  }
});

router.post('/forgotpassword',async(req,res)=>{
  try{
    const {email} = req.body;
    if(!email){
      return res.Code(400).json({
        message:"bad request"
      });
    }

    const available = await User.findOne({email});
    if(!available){
      return res.status(401).json({
        message:"No email address like that"
      });
    }
    //write code to send verification code
    //and add that code into Code document
    //Code.insert mapped to email & username

    let code = "magabaza1";//generateCode();

    // now code store in session
    const user_id = available._id;
    req.session.code_user_id = {
      user_id,
      code
    };
    
    res.status(200).json({
      message:"waiting for code"
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"server error"});
  }
});

router.post('/forgotpassword/:code',async(req,res)=>{
  try{
    const {code} = req.params;
    console.log("cooooooooooode");
    if(!req.session.code_user_id){
      return res.status(401).json({
        message:"Unauthorized"
      });
    }
    if(req.session.code_user_id.code != code){
      return res.status(401).json({
        message:"Incorrect code"
      });
    }
    //correct verification code
    res.status(201).json({
      message:"correct code"
    });
  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"server error"});
  }
});

router.patch('/updatepassword',async(req,res)=>{
  try{
    const {password} = req.body;
    if(!password){
      return res.sendStatus(400);
    }
    if(!req.session.id){
      return res.sendStatus(401);
    }

    const hashedPass = await bcrypt.hash(password,10);
    const updatedUser = await User.findByIdAndUpdate(
      req.session.code_user_id.user_id,
      {password:hashedPass},
      {new:true}
    );

    delete req.session.code_user_id;
    
    req.session.user_id = updatedUser._id;

    res.sendStatus(200);
  }
  catch(err){
    console.log(err);
    res.status(500).json({message:"server error"});
  }
});

router.get("/problems",(req,res)=>{
  const pdfFilePath = path.join(__dirname, '../', 'public', 'pdf', 'Assignment1.pdf');
  res.sendFile(pdfFilePath);
});

router.get('/newpassword', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/newpassword.html");
  res.sendFile(filePath);
});

router.get('/forgot', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/forgot.html");
  res.sendFile(filePath);
});
router.get('/login', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/login.html");
  res.sendFile(filePath);
});

router.get('/register', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/register.html");
  res.sendFile(filePath);
});

module.exports = router;
