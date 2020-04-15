const express = require("express");
let router = express.Router();
const server = require('../../server.js');
const data = server.data;

let images = [
    "images/audi.jpg",
    "images/porsche.png",
    "images/mercedes.jpeg",
    "images/bentley.jpg",
    "images/ninjaBike.jpg",
    "images/bike.jpg",
  ];
  
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
    if (!req.session.user) {
      res.redirect('/login')
    } else {
      collectionProfiles.findOne({
        username: req.session.user
      }, done)
  
      function done(err, useData) {
        data.user = useData;
  
        console.log(data)
        console.log(images)
        if (err) {
          next(err)
        } else {
          //verkrijg de url's van de user antwoorden
          if (data.user.answerOne == 1) {
            data.user.answerOneImg = images[0]
          } else {
            data.user.answerOneImg = images[1]
          }
          if (data.user.answerTwo == 1) {
            data.user.answerTwoImg = images[2]
          } else {
            data.user.answerTwoImg = images[3]
          }
          if (data.user.answerThree == 1) {
            data.user.answerThreeImg = images[4]
          } else {
            data.user.answerThreeImg = images[5]
          }
        }
  
        //verzamel alle users die niet gelijk zijn aan de huidige gebruiker en stop ze in een array
        collectionProfiles
          .find({
            username: {
              $ne: req.session.user,
            },
          })
          .toArray(doneTwo);
  
        function doneTwo(err, useData) {
          if (err) {
            throw err;
          } else {
  
            //push alle gebruikers met de zelfde antwoorden als jij in een array
            data.matches = [];
            console.log(data.user.answerOne)
            for (let i = 0; i < useData.length; i++) {
              if (
                data.user.answerOne == useData[i].answerOne &&
                data.user.answerTwo == useData[i].answerTwo &&
                data.user.answerThree == useData[i].answerThree
              ) {
                data.matches.push(useData[i]);
                console.log(`${useData[i].username} is toegevoegd aan matches`);
              }
  
              console.log(data.matches);
            }
  
  
          }
          res.render("overview.ejs", {
            data,
          });
        }
      }
    }
  
})

module.exports = router;