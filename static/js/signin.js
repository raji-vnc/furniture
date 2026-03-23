document.getElementById("loginForm").addEventListener("submit",function(e){
    e.preventDefault();
     const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    
    .then(data => {
    if (data.status === "success") {

        document.getElementById("message").innerText = "Login Successful ";

        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);

    } else {
        document.getElementById("message").innerText = "Invalid credentials ";
    }
})

})