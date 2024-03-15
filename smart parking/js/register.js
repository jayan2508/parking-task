document.addEventListener("DOMContentLoaded", function () {
    const registrationForm = document.getElementById("registrationForm");
    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const confirmPasswordInput = document.getElementById("confirmPassword");
    const carsInput = document.getElementById("cars");
    const bikesInput = document.getElementById("bikes");
    const carSlotContainer = document.getElementById("carSlotContainer");
    const bikeSlotContainer = document.getElementById("bikeSlotContainer");
    const carErrorMessage = document.getElementById("carErrorMessage");
    const bikeErrorMessage = document.getElementById("bikeErrorMessage");

    const API_URL = "http://localhost:3000/users";

    registrationForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        let hasValidationErrors = false;

        if (!firstNameInput.value.trim()) {
            document.getElementById("firstNameError").innerHTML = "Please enter your first name";
            hasValidationErrors = true;
        }

        if (!lastNameInput.value.trim()) {
            document.getElementById("lastNameError").innerHTML = "Please enter your last name";
            hasValidationErrors = true;
        }

        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if (!emailPattern.test(emailInput.value.trim())) {
            document.getElementById("emailError").innerHTML = "Please enter a valid email";
            hasValidationErrors = true;
        }

        if (!passwordInput.value.trim()) {
            document.getElementById("passwordError").innerHTML = "Please enter a password";
            hasValidationErrors = true;
        }

        if (!confirmPasswordInput.value.trim()) {
            document.getElementById("confirmPasswordError").innerHTML = "Please enter a confirm-password";
            hasValidationErrors = true;
        }

        if (passwordInput.value.trim() !== confirmPasswordInput.value.trim()) {
            document.getElementById("confirmPasswordError").innerHTML = "Passwords do not match";
            hasValidationErrors = true;
        }

        const emptyCarSlots = Array.from(document.querySelectorAll(".car-slot input")).some(carInput => carInput.value.trim() === "");
        if (emptyCarSlots) {
            carErrorMessage.innerHTML = "Please fill in all car slots";
            hasValidationErrors = true;
        }

        // Check if any bike slot is empty
        const emptyBikeSlots = Array.from(document.querySelectorAll(".bike-slot input")).some(bikeInput => bikeInput.value.trim() === "");
        if (emptyBikeSlots) {
            bikeErrorMessage.innerHTML = "Please fill in all bike slots";
            hasValidationErrors = true;
        }

        const carSlotInputs = document.querySelectorAll(".car-slot input");
        carSlotInputs.forEach(carInput => {
            carInput.addEventListener('input', () => {
                carErrorMessage.innerHTML = "";
            });
        });

        const bikeSlotInputs = document.querySelectorAll(".bike-slot input");
        bikeSlotInputs.forEach(bikeInput => {
            bikeInput.addEventListener('input', () => {
                bikeErrorMessage.innerHTML = "";
            });
        });


        if (parseInt(carsInput.value) < 1) {
            carErrorMessage.innerHTML = "Please enter at least 1 car";
            hasValidationErrors = true;
        }

        // Check if the number of bikes is less than 1
        if (parseInt(bikesInput.value) < 1) {
            bikeErrorMessage.innerHTML = "Please enter at least 1 bike";
            hasValidationErrors = true;
        }

        // Check if no car slots are created
        if (carSlotContainer.children.length === 0) {
            carErrorMessage.innerHTML = "Please add car slots";
            hasValidationErrors = true;
        }

        // Check if no bike slots are created
        if (bikeSlotContainer.children.length === 0) {
            bikeErrorMessage.innerHTML = "Please add bike slots";
            hasValidationErrors = true;
        }

        // Check for unique car numbers
        const carSlots = Array.from(document.querySelectorAll(".car-slot input"));
        const carNumbers = carSlots.map(carInput => carInput.value.trim());

        const uniqueCarNumbers = new Set(carNumbers);
        if (carNumbers.length !== uniqueCarNumbers.size) {
            carErrorMessage.innerHTML = "Please enter unique car numbers";
            hasValidationErrors = true;
        } else {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const users = await response.json();
                const existingCarNumbers = users.flatMap(user => Object.values(user.cars));
                const duplicateCarNumbers = carNumbers.filter(number => existingCarNumbers.includes(number));

                if (duplicateCarNumbers.length > 0) {
                    carErrorMessage.innerHTML = "Car numbers already exist";
                    hasValidationErrors = true;
                }
            } catch (error) {
                console.error("Error checking car uniqueness:", error);
            }
        }

        // Check for unique bike numbers
        const bikeSlots = Array.from(document.querySelectorAll(".bike-slot input"));
        const bikeNumbers = bikeSlots.map(bikeInput => bikeInput.value.trim());

        const uniqueBikeNumbers = new Set(bikeNumbers);
        if (bikeNumbers.length !== uniqueBikeNumbers.size) {
            bikeErrorMessage.innerHTML = "Please enter unique bike numbers";
            hasValidationErrors = true;
        } else {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const users = await response.json();
                const existingBikeNumbers = users.flatMap(user => Object.values(user.bikes));
                const duplicateBikeNumbers = bikeNumbers.filter(number => existingBikeNumbers.includes(number));

                if (duplicateBikeNumbers.length > 0) {
                    bikeErrorMessage.innerHTML = "Bike numbers already exist";
                    hasValidationErrors = true;
                }
            } catch (error) {
                console.error("Error checking bike uniqueness:", error);
            }
        }

        if (!emailInput.value.trim()) {
            document.getElementById("emailError").innerHTML = "Please enter your email";
            hasValidationErrors = true;
        } else {
            try {
                // Check if email already exists
                const response = await fetch(`${API_URL}?email=${emailInput.value.trim()}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.statusText}`);
                }

                const existingUsers = await response.json();
                const isEmailUnique = existingUsers.length === 0;

                if (!isEmailUnique) {
                    document.getElementById("emailError").innerHTML = "Email already exists";
                    hasValidationErrors = true;
                }
            } catch (error) {
                console.error("Error checking email uniqueness:", error);
            }
        }

        if (hasValidationErrors) {
            return;
        }

        const userData = {
            firstName: firstNameInput.value.trim(),
            lastName: lastNameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim(),
            cars: carNumbers.reduce((acc, car, index) => {
                acc[index + 1] = car;// Assuming unique keys for cars
                return acc;
            }, {}),
            bikes: bikeNumbers.reduce((acc, bike, index) => {
                acc[index + 1] = bike;// Assuming unique keys for bikes
                return acc;
            }, {}),
        };

        try {
            // Send a POST request to the JSON server
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            // Reset the form
            registrationForm.reset();

            const createdUser = await response.json();
            const userId = createdUser.id;

            // Redirect to parking.html
            window.location.href = `parking.html?firstName=${userData.firstName}&lastName=${userData.lastName}&userId=${userId}`;
        } catch (error) {
            console.error("Error saving user data:", error);
        }
    });

    firstNameInput.addEventListener('input', () => {
        document.getElementById("firstNameError").innerHTML = "";
    });

    lastNameInput.addEventListener('input', () => {
        document.getElementById("lastNameError").innerHTML = "";
    });

    emailInput.addEventListener('input', () => {
        document.getElementById("emailError").innerHTML = "";
    });

    passwordInput.addEventListener('input', () => {
        document.getElementById("passwordError").innerHTML = "";
    });

    confirmPasswordInput.addEventListener('input', () => {
        document.getElementById("confirmPasswordError").innerHTML = "";
    });

    carsInput.addEventListener('input', () => {
        carErrorMessage.innerHTML = "";
    });

    bikesInput.addEventListener('input', () => {
        bikeErrorMessage.innerHTML = "";
    });

    carSlotContainer.addEventListener('input', () => {
        carErrorMessage.innerHTML = "";
    });

    bikeSlotContainer.addEventListener('input', () => {
        bikeErrorMessage.innerHTML = "";
    });

    const cancelButton = document.getElementById("cancelButton");

    cancelButton.addEventListener("click", function () {
        document.getElementById("firstNameError").innerHTML = "";
        document.getElementById("lastNameError").innerHTML = "";
        document.getElementById("emailError").innerHTML = "";
        document.getElementById("passwordError").innerHTML = "";
        document.getElementById("confirmPasswordError").innerHTML = "";
        document.getElementById("carErrorMessage").innerHTML = "";
        document.getElementById("bikeErrorMessage").innerHTML = "";
    });

    const addCarsButton = document.getElementById("addCarsButton");

    addCarsButton.addEventListener("click", function () {
        const carsValue = parseInt(carsInput.value.trim());

        // Clear existing car slots
        carSlotContainer.innerHTML = "";
        totalCarsSlots = parseInt(carsValue);

        if (carsValue < 1) {
            carErrorMessage.innerHTML = "Please enter at least 1 car";
            return;
        }

        // Create slots for the car numbers
        if (carsValue !== "" && !isNaN(carsValue) && parseInt(carsValue) >= 0) {
            for (let i = 0; i < carsValue; i++) {
                const carSlot = document.createElement("div");
                carSlot.classList.add("car-slot");

                const carInput = document.createElement("input");
                carInput.type = "text";
                carInput.placeholder = 'Car Number';
                carInput.classList.add("form-control", "slot", "form-group");

                const closeIcon = document.createElement("span");
                closeIcon.classList.add("close-icon");
                closeIcon.innerHTML = "&times;";// HTML code for the 'times' (close) symbol

                closeIcon.addEventListener("click", function () {
                    // Update totalCarsSlots and set the value of the cars input to the total number of slots
                    totalCarsSlots--;
                    carsInput.value = totalCarsSlots;
                    carSlot.remove();
                });

                carSlot.appendChild(carInput);
                carSlot.appendChild(closeIcon);

                carSlotContainer.appendChild(carSlot);
            }
        }
    });

    const addBikesButton = document.getElementById("addBikesButton");

    addBikesButton.addEventListener("click", function () {
        const bikesValue = parseInt(bikesInput.value.trim());

        // Clear existing bike slots
        bikeSlotContainer.innerHTML = "";
        totalBikesSlots = parseInt(bikesValue);

        if (bikesValue < 1) {
            bikeErrorMessage.innerHTML = "Please enter at least 1 bike";
            return;
        }

        // Create slots for the bike numbers
        if (bikesValue !== "" && !isNaN(bikesValue) && parseInt(bikesValue) >= 0) {
            for (let i = 0; i < bikesValue; i++) {
                const bikeSlot = document.createElement("div");
                bikeSlot.classList.add("bike-slot");

                const bikeInput = document.createElement("input");
                bikeInput.type = "text";
                bikeInput.placeholder = 'Bike Number';
                bikeInput.classList.add("form-control", "slot", "form-group");

                const closeIcon = document.createElement("span");
                closeIcon.classList.add("close-icon");
                closeIcon.innerHTML = "&times;";// HTML code for the 'times' (close) symbol

                closeIcon.addEventListener("click", function () {
                    // Update totalBikesSlots and set the value of the bikes input to the total number of slots
                    totalBikesSlots--;
                    bikesInput.value = totalBikesSlots;
                    bikeSlot.remove();
                });

                bikeSlot.appendChild(bikeInput);
                bikeSlot.appendChild(closeIcon);

                bikeSlotContainer.appendChild(bikeSlot);
            }
        }
    });
});
