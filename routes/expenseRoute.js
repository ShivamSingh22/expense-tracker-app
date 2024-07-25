const express=require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');

router.post('/add',expenseController.addExpense);
router.get('/all',expenseController.getExpense);
router.delete('/delete/:id',expenseController.deleteExpense);

module.exports=router;