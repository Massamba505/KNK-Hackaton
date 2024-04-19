var express = require('express');
var router = express.Router();

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

module.exports = router;
