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
  .get("/register", registerForm)
  .get("/login", loginForm)
  .get("/add", createUserForm)
  .get("/findMatch", findMatch)
  .get("/overview", overview)
  .get("/matches", matches)
  .get("/logout", logout)
  .post("/registerUser", registerUser)
  .post("/login", compareCredentials)
  .post("/postQuestionAnswers", postQuestionAnswers)
  .post("/changeName", changeUserName)
  .post("/createProfile", upload.single("foto"), createAccountInformation)
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


//Register en Login functie
function gebruikers(req, res, next) {
  database.collection("users").find().toArray(done);

  function done(err, data) {
    if (err) {
      next(err);
    } else {
      res.render("login.ejs", {
        data: data
      });
    }
  }
}

function loginForm(req, res) {
  res.render("login.ejs", {
    data
  });
}

function registerForm(req, res) {
  res.render("register.ejs", {
    data
  });
}

// function registerUser(req, res, next) {
//   collectionUsers.insertOne({
//       username: req.body.username,
//       email: req.body.emailadres,
//       wachtwoord: req.body.wachtwoord,
//     },
//     done
//   );

//   function done(err, data) {
//     if (err) {
//       next(err);
//     } else {
//       req.session.user = req.body.username;
//       res.redirect("/add");
//     }
//   }
// }

function compareCredentials(req, res) {
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
}

//Update password function
function updatePassword(req, res) {
  let users = req.session.emailadres;
  console.log(users._id);

  database.collection("users").updateOne({
    _id: mongo.ObjectId(users._id)
  }, {
    $set: {
      email: req.body.emailadres,
      wachtwoord: req.body.wachtwoord,
    },
  });
  res.redirect("/login");
}

//vul data met foto's; op imageUrlX
function fillImages() {
  for (let i = 0; i < images.length; i++) {
    let index = "imageUrl" + (i + 1);
    data[index] = images[i];
  }
}
fillImages();


//pagina waarop een profiel gemaakt wordt
function createAccountInformation(req, res, next) {
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

//find match pagina
function findMatch(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    res.render('findMatch.ejs', {
      data
    })
  }

}

//verzenden van image op antwoorden van vraag
function postQuestionAnswers(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    collectionProfiles.findOneAndUpdate({
      username: req.session.user
    }, {
      $set: {
        answerOne: req.body.car1,
        answerTwo: req.body.car2,
        answerThree: req.body.car3
      }
    }, done);

    function done(err, data) {
      if (err) {
        next(err)
      } else {
        res.redirect('/overview')
      }
    }
  }
}


//pagina waarop je je matches kunt zien
function overview(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    collectionProfiles.findOne({
      username: req.session.user
    }, done)

    function done(err, useData) {
      data.user = useData;

      console.log(useData)
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
}

function changeUserName(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    //find de huidige gebruiker in de database en update zijn naam naar de nieuw ingevulde naam
    collectionAnswers.findOneAndUpdate({
      username: req.session.user
    }, {
      $set: {
        username: req.body.newName
      }
    }, done)

    function done(err, useData) {
      //verander de session van de gebruiker samen met het gerenderde data object
      req.session.user = req.body.newName;
      data.user.user = req.session.user;

      if (err) {
        next(err)
      } else {
        //render de pagina opnieuw om de nieuwe naam van de gebruiker te tonen
        res.render('overview.ejs', {
          data
        });
      }
    }
  }
}

function logout(req, res, next) {
  if (req.session.user) {
    req.session.destroy()
  }

  res.redirect('/login');
}

// ******************* */
//FEATURE MAX
//******************* */
function matches(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    // collectionProfiles.find().toArray(done)

    // function done(err, data) {
    //   if (err) {
    //     next(err)
    //   } else {

    //   }
    // }

    console.log(data)
    res.render('matches.ejs', {
      data: data
    })
  }
}

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


function createUserForm(req, res) {
  res.render("createUser.ejs", {
    data
  });
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

function notFound(req, res) {
  res.status(404).render("not-found.ejs");
}

app.listen(port, () => console.log(`app running on port: ${port}`));