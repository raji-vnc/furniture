document.getElementById('signupForm').addEventListener("submit",function(e){
    e.preventDefault();

    let username=document.getElementById("username").value 
    let password=document.getElementById("password").value
    let email=document.getElementById("email").value
    const confirmPassword = document.getElementById("confirmPassword").value;

if (password !== confirmPassword) {
    document.getElementById("message").innerText = "Passwords do not match ";
    return;
}
    fetch("http://127.0.0.1:8000/api/register/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("message").innerText = "Registered Successfully ";

        
        setTimeout(() => {
            window.location.href = "signin.html";
        }, 1500);
    })
    .catch(error => {
        document.getElementById("message").innerText = "Error registering user ";
    });
})