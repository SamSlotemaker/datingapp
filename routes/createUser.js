const express = require("express");
let router = express.Router();
const server = require('../server.js');
const data = server.data;
const multer = require("multer");
const upload = multer({
    dest: "public/upload/",
  });
  
//databaselet collectionProfiles;
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
function registerForm(req, res) {
    res.render("register.ejs", {
      data
    });
  }

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
    res.render("createUser.ejs", {
        data
      });
})


router.post('/', upload.single("foto"), (req, res) => {
        if (!req.session.user) {
          res.redirect('/login')
        } else {
          collectionProfiles.insertOne({
            username: req.session.user,
            naam: req.body.naam,
            foto: req.file ? req.file.filename : null,
            leeftijd: req.body.leeftijd,
            bio: req.body.bio
          }, done)
      
          function done(err, data) {
            if (err) {
              next(err)
            } else {
              res.redirect('/findMatch')
            }
          }
        }
      }
)

module.exports = router;