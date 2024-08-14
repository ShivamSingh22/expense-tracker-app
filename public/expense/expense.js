// const Razorpay = require('razorpay');

window.addEventListener('DOMContentLoaded',()=>{
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    console.log(decodedToken);
    const isPremium = decodedToken.ispremiumuser;

    if(isPremium){
        showPremiumUserMessage();
    }
    
    axios
    .get('http://localhost:3000/expense/all',{ headers : {"Authorization" : token}})
    .then((res)=>{
        const expenseArr = res.data;
        for(let i=0;i<expenseArr.length;i++){
            displayExpenses(expenseArr[i]);
        }
    })
    .catch(err => console.log(err));
})
const premiumMembershipButton = document.getElementById('rzp-button1');

function showPremiumUserMessage(){
    premiumMembershipButton.style.visibility='hidden';
    document.getElementById('message1').innerHTML= 'YOU ARE A PREMIUM USER';
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

premiumMembershipButton.onclick = async function(e) {
    const token = localStorage.getItem('token');
    try {
        const response = await axios.get('http://localhost:3000/purchase/premiummembership', { headers: { "Authorization": token } });
        console.log(response);

        var options = {
            "key": response.data.key_id,
            "order_id": response.data.order.id,
            "handler": async function(response) {
                try {
                    const result = await axios.post('http://localhost:3000/purchase/updatetransactionstatus', {
                        order_id: options.order_id,
                        payment_id: response.razorpay_payment_id,
                    }, {
                        headers: { "Authorization": token }
                    });
                    alert('YOU ARE A PREMIUM USER NOW');
                    
                    showPremiumUserMessage();
                    localStorage.setItem('token', result.data.token);
                    
                    //window.location.href = "../login-signup/login.html"

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
                    order_id: options.order_id 
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