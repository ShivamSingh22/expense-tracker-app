function handleFormSubmit(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const obj = {
        email: email
    }
    const msglbl = document.getElementById("msglbl");
    
    axios.post('http://localhost:3000/password/forgotpassword', obj)
        .then((res) => {
            msglbl.innerHTML = "<h3>Password Reset Link Sent. Check EMAIL!</h3>";
            msglbl.style.color = "green";
        })
        .catch((err) => {
            console.error("Error:", err);
            msglbl.innerHTML = "<h3>Failed to send reset link. Please try again.</h3>";
            msglbl.style.color = "red";
        });
}
