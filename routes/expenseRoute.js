const express=require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const userauthentication = require('../middlewares/auth');

router.post('/add',userauthentication.authenticate,expenseController.addExpense);
router.get('/all', userauthentication.authenticate ,expenseController.getExpense);
router.delete('/delete/:id',userauthentication.authenticate,expenseController.deleteExpense);
router.get('/download', userauthentication.authenticate,expenseController.downloadExpense)

module.exports=router;