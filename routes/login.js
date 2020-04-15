const express = require("express");
let router = express.Router();
const server = require('../server.js');
const data = server.data;

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
    res.render("login.ejs", {
        data
    });
})


router.post('/', (req, res) => {
    collectionUsers.findOne({
        email: req.body.emailadres
    }, done);

    function done(err, data) {
        // console.log(data);
        if (err) {
            next(err);
        } else {
            if (data.wachtwoord === req.body.wachtwoord) {
                console.log("succesvol ingelogd :)");
                req.session.user = data.username;
                res.redirect("/findMatch");
                // res.send("hoi");
            } else {
                console.log("login mislukt :(");
                res.redirect("/login");
            }
        }
    }
})

module.exports = router;