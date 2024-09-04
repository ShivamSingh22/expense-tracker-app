function handleFormSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const obj = {
        email:email
    }
    axios
    .post('http://localhost:3000/password/forgotpassword',obj)
    .then((res)=>{
        const msglbl = document.getElementById("msglbl");
        msglbl.innerHTML = "<h3>Password Reset Link Sent. Check EMAIL!</h3>"
        console.log(res); 
    })
    .catch((err)=>{
        console.log("ERROR HERE" + err);
    })
}
