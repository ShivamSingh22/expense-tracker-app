window.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const decodedToken = parseJwt(token);
    const isPremium = decodedToken.ispremiumuser;
  
    if (isPremium) {
      showPremiumUserMessage();
      showLeaderboard();
      document.getElementById("downloadexpense").style.visibility = "visible";
      document.getElementById("downloadhistory").style.visibility = "visible";
    }
  
    try {
      const objUrlParams = new URLSearchParams(window.location.search);
      const page = objUrlParams.get("page") || 1;
  
      await getProducts(page);
    } catch (err) {
      console.log(err);
    }
  });
  
async function getProducts(page) {
    const token = localStorage.getItem("token");
    try {
      const arr = await axios.get(
        `http://localhost:3000/expense/all?page=${page}`,
        {
          headers: { Authorization: token },
        }
      );
      console.log(arr);
      
      const expenseData = arr.data.expenses;
      const paginationInfo = arr.data;
      document.getElementById("expenseList").innerHTML = ""; // Clear existing expenses
      for (let i = 0; i < expenseData.length; i++) {
        displayExpenses(expenseData[i]);
      }
  
      showPagination(paginationInfo); // Call the showPagination function with pagination data
  
      return expenseData;
    } catch (err) {
      console.log(err);
    }
  }
  
function showPagination({
  currentPage,
  hasNextPage,
  nextPage,
  hasPreviousPage,
  previousPage,
  lastPage,
}) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  if (hasPreviousPage) {
    const btn2 = document.createElement("button");
    btn2.innerHTML = previousPage;
    btn2.addEventListener('click', () => {
        getProducts(previousPage);
    })
    pagination.appendChild(btn2)
  }

  const btn1 = document.createElement('button');
  btn1.innerHTML = `<h3>${currentPage}</h3>`
  btn1.addEventListener('click',()=>{
        getProducts(currentPage);
  })
  pagination.appendChild(btn1);

  if(hasNextPage){
    const btn3 = document.createElement('button');
    btn3.innerHTML = nextPage
     btn3.addEventListener('click',()=>{
        getProducts(nextPage);
  })
  pagination.appendChild(btn3);

  if(currentPage!= lastPage - 1){
    const dotLbl = document.createElement('label');
  dotLbl.innerHTML= "...";
  const lastBtn = document.createElement('button');
  lastBtn.innerHTML = lastPage;
  pagination.appendChild(dotLbl);
  pagination.appendChild(lastBtn);
  }
  
  }
}

const premiumMembershipButton = document.getElementById("rzp-button1");

function showPremiumUserMessage() {
  premiumMembershipButton.style.visibility = "hidden";
  document.getElementById("message1").innerHTML = "YOU ARE A PREMIUM USER";
}

function showLeaderboard() {
  const btnLeaderboard = document.createElement("input");
  btnLeaderboard.type = "button";
  btnLeaderboard.value = "Show Leaderboard";
  btnLeaderboard.onclick = async () => {
    const token = localStorage.getItem("token");
    try {
      const userLeaderboardArray = await axios.get(
        "http://localhost:3000/premium/showLeaderboard",
        { headers: { Authorization: token } }
      );
      console.log(userLeaderboardArray.data);

      const leaderboardList = document.getElementById("leaderboardList");
      leaderboardList.innerHTML = "<h1>Leaderboard</h1>";
      userLeaderboardArray.data.forEach((userDetails) => {
        leaderboardList.innerHTML += `<li>User ID: ${userDetails.username} - Total Expense: ${userDetails.totalExpenses}</li>`;
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  };
  document.getElementById("message1").appendChild(btnLeaderboard);
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

premiumMembershipButton.onclick = async function (e) {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      "http://localhost:3000/purchase/premiummembership",
      { headers: { Authorization: token } }
    );
    console.log(response);

    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      handler: async function (response) {
        try {
          const result = await axios.post(
            "http://localhost:3000/purchase/updatetransactionstatus",
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            {
              headers: { Authorization: token },
            }
          );
          alert("YOU ARE A PREMIUM USER NOW");

          showPremiumUserMessage();
          showLeaderboard();
          localStorage.setItem("token", result.data.token);
        } catch (err) {
          console.error(err);
        }
      },
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
    e.preventDefault();

    rzp1.on("payment.failed", async function (response) {
      console.log(response);
      alert("Something went wrong");
      try {
        await axios.post(
          "http://localhost:3000/purchase/transactionfailed",
          {
            order_id: options.order_id,
          },
          {
            headers: { Authorization: token },
          }
        );
      } catch (error) {
        console.log("ERROR IN PAYMENT FAILED UPDATION: " + error);
      }
    });
  } catch (error) {
    console.error("Error during premium membership request:", error);
  }
};

function displayExpenses(expenseDetail) {
  const ul = document.getElementById("expenseList");
  const li = document.createElement("li");
  li.innerHTML = `${expenseDetail.amount} - ${expenseDetail.description} - ${expenseDetail.category}`;
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "DELETE";
  li.appendChild(deleteBtn);
  ul.appendChild(li);

  deleteBtn.addEventListener("click", function () {
    deleteExpense(expenseDetail.id, li);
  });
}

function deleteExpense(expId, listItem) {
  const token = localStorage.getItem("token");

  axios
    .delete(`http://localhost:3000/expense/delete/${expId}`, {
      headers: { Authorization: token },
    })
    .then(() => {
      listItem.remove();
    })
    .catch((err) => {
      console.log(err);
    });
}

function handleFormSubmit(event) {
  event.preventDefault();

  const expense = event.target.expense.value;
  const description = event.target.description.value;
  const category = event.target.category.value;

  const obj = {
    expense: expense,
    description: description,
    category: category,
  };
  const token = localStorage.getItem("token");

  axios
    .post("http://localhost:3000/expense/add", obj, {
      headers: { Authorization: token },
    })
    .then((res) => {
      displayExpenses(res.data.newExpense);
      console.log(res.data);
      event.target.reset();
    })
    .catch((err) => {
      console.log(err);
    });
}

function download() {
  const token = localStorage.getItem("token");
  axios
    .get("http://localhost:3000/expense/download", {
      headers: { Authorization: token },
    })
    .then((response) => {
      if (response.status === 200) {
        var a = document.createElement("a");
        a.href = response.data.fileUrl;
        a.download = "myexpense.csv";
        a.click();
      } else {
        throw new Error(response.data.message);
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
