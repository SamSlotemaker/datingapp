const express = require("express");
let router = express.Router();
const server = require('../server.js');
const data = server.data;

//database
let collectionProfiles;
let collectionUsers;
let collectionAnswers = null;
const MongoClient = require("mongodb").MongoClient;
const uri =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASS +
  "@datingapp-alfy7.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//database connect
client.connect(function (err, client) {
  if (err) {
    throw err;
  }
  collectionAnswers = client.db("datingapp").collection("userAnswers");
  collectionProfiles = client.db("datingapp").collection("profiles");
  collectionUsers = client.db("datingapp").collection("users")
});

router.get('/', (req, res) => {
        res.render("register.ejs", {
          data
        });
})


router.post('/', (req, res) => {
    collectionUsers.insertOne({
        username: req.body.username,
        email: req.body.emailadres,
        wachtwoord: req.body.wachtwoord,
      },
      done
    );
  
    function done(err, data) {
      if (err) {
        next(err);
      } else {
        req.session.user = req.body.username;
        res.redirect("/add");
      }
    }
})

module.exports = router;