const LocalStrategy = require("passport").Strategy;
const bcrypt = require("bcrypt");

// Load User model
User = require("mongodb").MongoClient;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match user
      collectionUsers
        .findOne({
          email: req.body.email,
        })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "That email is not registered",
            });
          }

          // Match password
          bcrypt.compare(password, req.body.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        });
    })
  );

  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    collectionUsers.findById(id, function (err, user) {
      done(err, user);
    });
  });
};
