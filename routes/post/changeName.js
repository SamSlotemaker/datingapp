const express = require("express");
let router = express.Router();
const server = require('../../server.js');
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

router.post('/', (req, res, next) => {

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
            data.user.username = req.session.user;

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
)

module.exports = router;