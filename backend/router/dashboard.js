const express = require('express');
const router = express.Router();

const Controller = require('../controllers/buscontrollers');


// GET: Dashboard page
router.get('/dashboard',Controller.dashboard);

module.exports = router;
