document.getElementById("loginForm").addEventListener("submit",function(e){
    e.preventDefault();
     const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/api/accounts/login/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
    
 .then(response=>response.json())
 .then(data => {
        console.log(data);  // debug

        if (data.status === "success") {

            document.getElementById("message").innerText = "Login Successful ";

            // store token if exists
            if (data.access) {
                localStorage.setItem("access", data.access);
            }

            setTimeout(() => {
                window.location.href = homeUrl;
            }, 1000);

        } else {
            document.getElementById("message").innerText = "Invalid credentials ";
        }
    })

    .catch(error => {
        console.error(error);
    });
    

})
