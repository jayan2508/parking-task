document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const emailErrorElement = document.getElementById("emailError");
    const passwordErrorElement = document.getElementById("passwordError");

    loginForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const enteredEmail = formData.get("email").trim();
        const enteredPassword = formData.get("password").trim();

        const API_URL = "http://localhost:3000/users";

        try {
            // Fetch user data from the JSON server
            const response = await fetch(`${API_URL}?email=${encodeURIComponent(enteredEmail)}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const users = await response.json();
            const user = users[0]; // Assuming there's only one user with a given email

            emailErrorElement.textContent = "";
            passwordErrorElement.textContent = "";

            if (!enteredEmail || !enteredPassword) {
                if (!enteredEmail) {
                    emailErrorElement.textContent = "Please enter your email";
                }
                if (!enteredPassword) {
                    passwordErrorElement.textContent = "Please enter your password";
                }
                return;
            }

            if (!user) {
                emailErrorElement.textContent = "User not found. Please check your email";
            } else if (user.password !== enteredPassword) {
                passwordErrorElement.textContent = "Incorrect password. Please try again";
            } else {
                loginForm.reset();
                
                // Redirect to parking.html with user data in the URL
                window.location.href = `parking.html?firstName=${encodeURIComponent(user.firstName)}&lastName=${encodeURIComponent(user.lastName)}&id=${encodeURIComponent(user.id)}`;
            }
        } catch (error) {
            // Handle errors if needed
            console.error("Error fetching user data:", error);
        }
    });

    const emailInput = loginForm.querySelector('input[name="email"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');

    emailInput.addEventListener('input', () => {
        emailErrorElement.textContent = "";
    });

    passwordInput.addEventListener('input', () => {
        passwordErrorElement.textContent = "";
    });

    const cancelButton = document.getElementById("cancelButton");

    cancelButton.addEventListener("click", function () {
        document.getElementById("emailError").innerHTML = "";
        document.getElementById("passwordError").innerHTML = "";
    });
});

var passwordEye;
function passwordVisible() {
    if (passwordEye === 1) {
        document.getElementById("password").type = 'password';
        document.getElementById("pass-icon").src = 'img/eye-hide.png';
        passwordEye = 0;
    } else {
        document.getElementById("password").type = 'text';
        document.getElementById("pass-icon").src = 'img/eye.png';
        passwordEye = 1;
    }
}
