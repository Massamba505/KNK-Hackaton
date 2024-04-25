var express = require('express');
var router = express.Router();
const path=require("path");

/* GET home page. */

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

router.get('/home', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/home.html");
  res.sendFile(filePath);
});
router.get('/leaderboard', function(req, res, next) {
  const filePath = path.join(__dirname, "../public/leaderboard.html");
  res.sendFile(filePath);
});

module.exports = router;
