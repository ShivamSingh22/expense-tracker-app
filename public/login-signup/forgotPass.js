function handleFormSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const obj = {
        email:email
    }
    axios
    .post('http://localhost:3000/password/forgotpassword',obj)
    .then((res)=>{
        console.log(res); 
    })
    .catch((err)=>{
        console.log("ERROR HERE" + err);
    })
}
