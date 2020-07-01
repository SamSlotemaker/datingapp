const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
require("dotenv").config();
const session = require("express-session");
const ejs = require("ejs");
const mongo = require("mongodb");
const multer = require("multer");
const ejsLint = require("ejs-lint");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const plainTextPassword = "dit_is_niet_mijn_wachtwoord";
const upload = multer({
  dest: "public/upload/",
});

// database configuratie
let db;
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

let data = {
  title: "datingapp"
};

exports.data = data;

const login = require('./routes/login.js');
const register = require('./routes/register.js');
const createUser = require('./routes/createUser.js');
const findMatch = require('./routes/findMatch.js')
const overview = require('./routes/get/overview.js')
const matches = require('./routes/get/matches.js')
const logout = require('./routes/get/logout.js')
const notFound = require('./routes/get/notFound.js')
const changeUserName = require('./routes/post/changeName.js')
//routes
app
  .use(express.static("public"))
  .set("view engine", "ejs")
  .set("views", "view")
  .use(
    express.urlencoded({
      extended: false,
    })
  )
  .use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  )

  .use("/login", login)
  .use("/register", register)
  .use("/add", createUser)
  .use("/findMatch", findMatch)
  .use("/overview", overview)
  .use("/matches", matches)
  .use("/logout", logout)
  .use("/changeName", changeUserName)
  .get("/:id", profile)
  .delete("/:id", deleteUserProfile)
  .use(notFound)

//informatie declaraties
let images = [
  "images/audi.jpg",
  "images/porsche.png",
  "images/mercedes.jpeg",
  "images/bentley.jpg",
  "images/ninjaBike.jpg",
  "images/bike.jpg",
];

exports.images = images;

//vul data met foto's; op imageUrlX
function fillImages() {
  for (let i = 0; i < images.length; i++) {
    let index = "imageUrl" + (i + 1);
    data[index] = images[i];
  }
}
fillImages();

// ******************* */
//FEATURE MAX
//******************* */
function profile(req, res, next) {
  let id = req.params.id;
  let profileObject;
  collectionProfiles.findOne({
      _id: new mongo.ObjectID(id),
    },
    done
  );

  function done(err, data) {
    if (err) {
      next(err);
    } else {

      profileObject = data;

      collectionUsers.findOne({
          username: data.username
        },
        (err, useData) => {
          if (err) {
            console.log(err);
            next(err);
          } else {
            profileObject.userLogin = useData
            res.render("detail.ejs", {
              data: profileObject,
            });
          }
        })
    }
  }
}

function deleteUserProfile(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    var id = req.params.id

    collectionProfiles.deleteOne({
      _id: new mongo.ObjectID(id)
    }, done)

    function done(err) {
      if (err) {
        next(err)
      } else {

        res.json({
          status: 'ok'
        })

      }
    }
  }
}

//ongeldige pagina


app.listen(port, () => console.log(`app running on port: ${port}`));