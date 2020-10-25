//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const Speakeasy = require("speakeasy");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.post("/totp-secret", (request, response, next) => { });
app.post("/totp-generate", (request, response, next) => { });
app.post("/totp-validate", (request, response, next) => { });

mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true});

const articleSchema = {
  firstName: String,
  lastName: String,
  email:String,
  country:String,
  state:String,
  pin:Number
};

const User = mongoose.model("User", articleSchema);


app.route("/users")

.get(function(req, res){
  User.find(function(err, foundUsers){
    if (!err) {
      res.send(foundUsers);
    } else {
      res.send(err);
    }
  });
})

.post(function(req, res){

  const newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email:req.body.email,
    country:req.body.country,
    state:req.body.state,
    pin:req.body.pin
  });

  newUser.save(function(err){
    if (!err){
      res.send("Successfully added a new user.");
    } else {
      res.send(err);
    }
  });
})

.delete(function(req, res){

  User.deleteMany(function(err){
    if (!err){
      res.send("Successfully deleted all articles.");
    } else {
      res.send(err);
    }
  });
});

app.post("/totp-secret", (request, response, next) => {
  var secret = Speakeasy.generateSecret({ length: 20 });
  response.send({ "secret": secret.base32 });
});

app.post("/totp-generate", (request, response, next) => {
  response.send({
      "token": Speakeasy.totp({
          secret: request.body.secret,
          encoding: "base32"
      }),
      "remaining": (30 - Math.floor((new Date()).getTime() / 1000.0 % 30))
  });
});

app.post("/totp-validate", (request, response, next) => {
  response.send({
      "valid": Speakeasy.totp.verify({
          secret: request.body.secret,
          encoding: "base32",
          token: request.body.token,
          window: 0
      })
  });
});


app.route("/users/:userEmails")

.get(function(req, res){

  User.findOne({email: req.params.userEmails}, function(err, foundUser){
    if (foundUser) {
      res.send(foundUser);
    } else {
      res.send("No articles matching that title was found.");
    }
  });
})

.put(function(req, res){

  User.update(
    {email: req.params.userEmails},
    {firstName: req.body.firstName, lastName: req.body.lastName,pin:req.body.pin},
    {overwrite: true},
    function(err){
      if(!err){
        res.send("Successfully updated the selected user.");
      }
    }
  );
})

.delete(function(req, res){

  User.deleteOne(
    {userEmail: req.params.userEmails},
    function(err){
      if (!err){
        res.send("Successfully deleted the corresponding user.");
      } else {
        res.send(err);
      }
    }
  );
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
