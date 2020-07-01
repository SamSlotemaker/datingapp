const express = require("express");
let router = express.Router();
const server = require('../../server.js');
const data = server.data;

router.get('/', (req, res) => {
        if (!req.session.user) {
            res.redirect('/login')
        } else {
            console.log(data)
            res.render('matches.ejs', {
                data: data
            })
        }
    }
)
module.exports = router;