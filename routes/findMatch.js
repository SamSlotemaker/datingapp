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
    if (!req.session.user) {
        res.redirect('/login')
    } else {
        res.render('findMatch.ejs', {
            data
        })
    }

})


router.post('/', (req, res) => {
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
})

module.exports = router;