
require('/server')

const registerUser = (req, res, next) => {
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
  }
  
exports.registerUser = registerUser;