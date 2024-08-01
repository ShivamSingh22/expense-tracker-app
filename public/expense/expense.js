// const Razorpay = require('razorpay');

window.addEventListener('DOMContentLoaded',()=>{
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3000/expense/all',{ headers : {"Authorization" : token}})
    .then((res)=>{
        const expenseArr = res.data;
        for(let i=0;i<expenseArr.length;i++){
            displayExpenses(expenseArr[i]);
        }
    })
    .catch(err => console.log(err));
})
document.getElementById('rzp-button1').onclick = async function(e) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
        console.log(response);

        var options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function(response) {
                try {
                    await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                    }, {
                        headers: { "Authorization": token }
                    });
                    alert('YOU ARE A PREMIUM USER NOW');
                } catch (err) {
                    console.error(err);
                }
            },
        };

        const rzp1 = new Razorpay(options);
        rzp1.open();
        e.preventDefault();

        rzp1.on('payment.failed', async function(response) {
            console.log(response);
            alert('Something went wrong');
            try {
                await axios.post('http://localhost:3000/purchase/transactionfailed', {
                    order_id: options.order_id  // Use order_id instead of orderid
                }, {
                    headers: { "Authorization": token }
                });
            } catch (error) {
                console.log('ERROR IN PAYMENT FAILED UPDATION: ' + error);
            }
        });
    } catch (error) {
        console.error('Error during premium membership request:', error);
    }
};


function displayExpenses(expenseDetail){
    const ul = document.getElementById('expenseList');
    const li = document.createElement('li');
    li.innerHTML=`${expenseDetail.amount} - ${expenseDetail.description} - ${expenseDetail.category}`;
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent='DELETE';
    li.appendChild(deleteBtn);
    ul.appendChild(li);

    deleteBtn.addEventListener('click',function(){
        deleteExpense(expenseDetail.id,li);
    })
}

function deleteExpense(expId,listItem){
    const token = localStorage.getItem('token');

    axios
    .delete(`http://localhost:3000/expense/delete/${expId}`,{ headers : {"Authorization" : token}})
    .then(()=>{
      listItem.remove();
    })
    .catch((err)=>{
      console.log(err);
    })
}


function handleFormSubmit(event){
    event.preventDefault();

    const expense = event.target.expense.value;
    const description = event.target.description.value;
    const category = event.target.category.value;

    const obj= {
        expense:expense,
        description:description,
        category:category
    }
    const token = localStorage.getItem('token');

    axios
    .post('http://localhost:3000/expense/add',obj,{ headers : {"Authorization" : token}})
    .then((res)=> {
        displayExpenses(res.data.newExpense);
        console.log(res.data);
        event.target.reset();
    })
    .catch(err=>{
        console.log(err);
    })
}