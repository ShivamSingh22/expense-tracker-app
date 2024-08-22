const express=require('express');
const router = express.Router();
const premiumController = require('../controllers/premiumController');
const userauthentication = require('../middlewares/auth');

router.get('/showLeaderboard', userauthentication.authenticate , premiumController.getUserLeaderboard);

module.exports=router;