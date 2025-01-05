const express = require("express");
const router = express.Router();
const loginHandler = require("../models/loginHandler");
const registerHandler = require("../models/registerHandler");

router.post("/login", loginHandler);
router.post("/register", registerHandler);

module.exports = router;
