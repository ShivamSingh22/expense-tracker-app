window.addEventListener('DOMContentLoaded',()=>{
    axios.get('http://localhost:3000/expense/all')
    .then((res)=>{
        const expenseArr = res.data;
        for(let i=0;i<expenseArr.length;i++){
            displayExpenses(expenseArr[i]);
        }
    })
    .catch(err => console.log(err));
})

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
    axios
    .delete(`http://localhost:3000/expense/delete/${expId}`)
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

    axios
    .post('http://localhost:3000/expense/add',obj)
    .then((res)=> {
        displayExpenses(res.data.newExpense);
        console.log(res.data);
        event.target.reset();
    })
    .catch(err=>{
        console.log(err);
    })
}