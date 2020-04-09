const express = require("express");
const app = express();
const port = 3000;
require("dotenv").config();
const session = require("express-session");
const ejs = require("ejs");
const mongodb = require("mongodb");
const multer = require("multer");
const ejsLint = require("ejs-lint");
const bodyparser = require("body-parser");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const plainTextPassword = "dit_is_niet_mijn_wachtwoord";
const upload = multer({
  dest: "public/upload/",
});

//database configuratie
// let collectionAnswers = null;
// let db;
// let collectionProfiles = null;
// const MongoClient = require("mongodb").MongoClient;
// const uri =
//   "mongodb+srv://" +
//   process.env.DB_USER +
//   ":" +
//   process.env.DB_PASS +
//   "@datingapp-alfy7.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, {
//   useNewUrlParser: true,
// });

// //database connect
// client.connect(function (err, client) {
//   if (err) {
//     throw err;
//   }
//   collectionAnswers = client.db("datingapp").collection("userAnswers");
//   collectionProfiles = client.db("datingapp").collection("profiles");
// });

let data = {
  title: "datingapp",
  page: "Registratie",
  name: "Sjoerd",
};

//MongoDB database
let database = null;

const url = "mongodb://" + process.env.DB_HOST + ":" + process.env.DB_PORT;

mongodb.MongoClient.connect(url, { useUnifiedTopology: true }, function (
  err,
  client
) {
  if (err) {
    console.log(err);
  }

  collectionUsers = client.db("datingapp").collection("users")
  collectionAnswers = client.db("datingapp").collection("userAnswers");
  collectionProfiles = client.db("datingapp").collection('profiles')
})


  database = client.db(process.env.DB_NAME);
  console.log("successfully connected to db");
});

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
  .get("/finding", findMatch)
  .post("/postQuestionAnswers", postQuestionAnswers)
  .get("/matches", matchesPage)
  .post("/changeName", changeUserName)
  .get("/start", matches)
  .post("/", upload.single("foto"), add)
  .get("/add", form)
  .get("/:id", profile)
  .delete("/:id", remove)
  .use(notFound);

app
  .post("/registerUser", add)
  .get("/", gebruikers)
  .get("/registratie", Registratieform)
  .get("/login", loginForm)
  .get("/login", compareCredentials)
  .get("/loginDone", compareCredentials)
  .get("/loginFailed", compareCredentials);
  .post('/', upload.single('foto'), createAccountInformation)
  .get('/createUser', createUser)

//informatie declaraties
let images = [
  "images/audi.jpg",
  "images/porsche.png",
  "images/mercedes.jpeg",
  "images/bentley.jpg",
  "images/ninjaBike.jpg",
  "images/bike.jpg",
];

// let data = {
//   title: "Datingapp",
// };

//Register en Login functie

function gebruikers(req, res, next) {
  database.collection("users").find().toArray(done);

  function done(err, data) {
    if (err) {
      next(err);
    } else {
      res.render("login.ejs", { data: data });
    }
  }
}

function loginForm(req, res) {
  res.render("login.ejs", { data });
}

function Registratieform(req, res) {
  res.render("registratie.ejs", { data });
}

function add(req, res, next) {
  database.collection("users").insertOne(
    {
      naam: req.body.voornaam,
      email: req.body.emailadres,
      wachtwoord: req.body.wachtwoord,
    },
    done
  );
  function done(err, data) {
    if (err) {
      next(err);
    } else {
      res.redirect("/login");
    }
  }
}

function compareCredentials(req, res) {
  database.collection("users").findOne({ email: req.body.emailadres }, done);

  function done(err, data) {
    if (err) {
      next(err);
    } else {
      if (data.wachtwoord === req.body.wachtwoord) {
        console.log("succesvol ingelogd :)");
        res.redirect("loginDone.ejs");
      } else {
        console.log("login mislukt :(");
        res.render("loginFailed.ejs");
      }
    }
  }
}

//Update password function
function updatePassword(req, res) {
  let users = req.session.emailadres;
  console.log(users._id);

  database.collection("users").updateOne(
    { _id: mongo.ObjectId(users._id) },
    {
      $set: {
        email: req.body.emailadres,
        wachtwoord: req.body.wachtwoord,
      },
    }
  );
  res.redirect("/login");
}

//maak een functie van
//vul data met foto's; op imageUrlX
function fillImages() {
  for (let i = 0; i < images.length; i++) {
    let index = "imageUrl" + (i + 1);
    data[index] = images[i];
  }
}
fillImages();


//find match pagina
function findMatch(req, res, next) {
  //delete de huidige antwoorden van de ingelogde gebruiker
  collectionAnswers.deleteOne(
    {
      user: req.session.user,
    },
    done
  );

  function done(err, useData) {
    if (err) {
      next(err);
    } else {
      req.session.user = "SamSloot";
      res.render("finding.ejs", {
        data,
      });
    }
  }
}

//verzenden van image op antwoorden van vraag
function postQuestionAnswers(req, res, next) {
  collectionAnswers.insertOne(
    {
      user: req.session.user,
      answerOne: req.body.car1,
      answerTwo: req.body.car2,
      answerThree: req.body.car3,
    },
    done
  );


function registerUser(req, res, next) {
  collectionUsers.insertOne({
      naam: req.body.username,
      email: req.body.emailadres,
      wachtwoord: req.body.wachtwoord
    },
    done
  );

  function done(err, useData) {
    if (err) {
      next(err);
    } else {
      res.redirect("/matches");
    }
  }
}

//pagina waarop je je matches kunt zien
function matchesPage(req, res, next) {
  req.session.user = "SamSloot";
  console.log(req.session.user);
  collectionAnswers.findOne(
    {
      user: req.session.user,
    },
    done
  );

function createAccountInformation(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    collectionProfiles.insertOne({
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
        // res.redirect('/' + data.insertedId)
      }
    }
  }
}

//find match pagina
function findMatch(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    //delete de huidige antwoorden van de ingelogde gebruiker
    collectionAnswers.deleteOne({
      user: req.session.user
    }, done)

    function done(err, useData) {
      if (err) {
        next(err)
      } else {
        res.render('findMatch.ejs', {
          data
        })
      }
    }
  }
}

//verzenden van image op antwoorden van vraag
function postQuestionAnswers(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    collectionAnswers.insertOne({
      user: req.session.user,
      answerOne: req.body.car1,
      answerTwo: req.body.car2,
      answerThree: req.body.car3
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
function matchesPage(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    console.log(req.session.user);
    collectionAnswers.findOne({
      user: req.session.user
    }, done)

    function done(err, useData) {
      data.user = useData;

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
      collectionAnswers
        .find({
          user: {
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
          for (let i = 0; i < useData.length; i++) {
            if (
              data.user.answerOne == useData[i].answerOne &&
              data.user.answerTwo == useData[i].answerTwo &&
              data.user.answerThree == useData[i].answerThree
            ) {
              data.matches.push(useData[i]);
              console.log(`${useData[i].user} is toegevoegd aan matches`);
            }
          }
        }
        res.render("matches.ejs", {
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
      user: req.session.user
    }, {
      $set: {
        user: req.body.newName
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
        res.render('matches.ejs', {
          data
        });
      }
    }
  }
}

// ******************* */
//FEATURE MAX
//******************* */
function matches(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    collectionProfiles.find().toArray(done)

    function done(err, data) {
      if (err) {
        next(err)
      } else {
        console.log(data)
        res.render('matches2.ejs', {
          data: data
        })
      }
    }
  }
}

function profile(req, res, next) {
  let id = req.params.id;

  collectionProfiles.findOne(
    {
      _id: new mongo.ObjectID(id),
    },
    done
  );

  function done(err, data) {
    if (err) {
      next(err);
    } else {
      res.render("detail.ejs", {
        data: data,
      });
    }
  }
}

function form(req, res) {
  res.render("add.ejs");
}

function add(req, res, next) {
  collectionProfiles.insertOne(
    {
      naam: req.body.naam,
      foto: req.file ? req.file.filename : null,
      leeftijd: req.body.leeftijd,
      bio: req.body.bio,
    },
    done
  );

  function done(err, data) {
    if (err) {
      next(err);
    } else {
      res.redirect("/" + data.insertedId);
    }
  }
}

function remove(req, res, next) {
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
