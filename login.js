function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('message');
    if (username === "admin" && password === "password") {
        message.textContent = "Login Successful!";
        message.style.color = "green";
    } else {
        message.textContent = "Invalid Credentials!";
        message.style.color = "red";
    }
}

