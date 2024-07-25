function handleFormSubmit(event){
    event.preventDefault();

    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;

    const obj ={
        username: username,
        email: email,
        password: password
    }

    axios
    .post('http://localhost:3000/user/signup',obj)
    .then((res)=> {
        event.target.reset();
    })
    .catch(err=> console.log(err));
}