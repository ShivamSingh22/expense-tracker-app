const express=require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const userauthentication = require('../middlewares/auth');

router.get('/premiummembership', userauthentication.authenticate ,purchaseController.getPremium);
router.post('/updatetransactionstatus', userauthentication.authenticate, purchaseController.postSuccessPremium);
router.post('/transactionfailed', userauthentication.authenticate, purchaseController.postFailedPremium);
module.exports=router;