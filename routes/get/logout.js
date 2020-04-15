const express = require("express");
let router = express.Router();

router.get('/', (req, res) => {
        if (req.session.user) {
            req.session.destroy()
        }
        res.redirect('/login');
    }
)

module.exports = router;