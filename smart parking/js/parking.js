document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const firstName = urlParams.get('firstName');
    const lastName = urlParams.get('lastName');

    // Display the uppercase first letters of the first name and last name
    if (firstName && lastName) {
        const profileNameElement = document.getElementById('profileName');
        const formattedFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
        const formattedLastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
        profileNameElement.textContent = `${formattedFirstName.charAt(0)}${formattedLastName.charAt(0)}`;
    }

    try {
        const response = await fetch('http://localhost:8000/carData');
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const bookedSlots = await response.json();

        // Function to generate car slots with IDs A01 to A16, B01 to B16, C01 to C16, D01 to D16
        function generateCarSlots(containerId, prefix, bookedSlots) {
            const carSlotsContainer = document.getElementById(containerId);

            for (let i = 1; i <= 16; i++) {
                const carBox = document.createElement("div");
                carBox.classList.add("car-box");
                carBox.classList.add(i % 2 === 0 ? "border-right" : "border-left");
                carBox.classList.add(i <= 8 ? "border-top" : "border-bottom");

                const carSlot = document.createElement("div");
                carSlot.classList.add("car-slot");
                const slotId = `${prefix}${i.toString().padStart(2, '0')}`;
                carSlot.textContent = slotId;

                // Check if the slot is already booked and set the initial color
                const isBooked = bookedSlots.some(booking => booking.slot === slotId);
                if (isBooked) {
                    // Extract first name and last name from URL parameters
                    const urlParams = new URLSearchParams(window.location.search);
                    const firstName = urlParams.get('firstName');
                    const lastName = urlParams.get('lastName');

                    // Check if first name and last name match the booked slot
                    if (
                        firstName &&
                        lastName &&
                        bookedSlots.some(
                            booking =>
                                booking.slot === slotId &&
                                booking.firstName === firstName &&
                                booking.lastName === lastName
                        )
                    ) {
                        carSlot.style.backgroundColor = 'orange';
                        carSlot.style.color = 'white';
                    } else {
                        // Show an image
                        carSlot.style.backgroundColor = 'white';
                        carSlot.innerHTML = `<img src="img/transport.png" alt="Booked" />`;
                    }
                }

                carBox.appendChild(carSlot);
                carSlotsContainer.appendChild(carBox);
            }
        }

        // Call the function to generate car slots for A01 to A16 with booked slots
        generateCarSlots("carSlotsContainerA", "A", bookedSlots);

        // Call the function to generate car slots for B01 to B16 with booked slots
        generateCarSlots("carSlotsContainerB", "B", bookedSlots);

        // Call the function to generate car slots for C01 to C16 with booked slots
        generateCarSlots("carSlotsContainerC", "C", bookedSlots);

        // Call the function to generate car slots for D01 to D16 with booked slots
        generateCarSlots("carSlotsContainerD", "D", bookedSlots);

    } catch (error) {
        console.error('Error fetching data:', error);
    }

    // Modal functionality
    const modal = document.getElementById('myModal');
    const carSlots = document.querySelectorAll('.car-slot');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const submitBtn = document.getElementById('submitBtn');
    const input1 = document.getElementById('input1');
    const validationMessage = document.getElementById('validationMessage');

    try {
        const response = await fetch('http://localhost:3000/users');
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const userData = await response.json();

        // Populate the carNumberDropdown with fetched car numbers
        const carNumberDropdown = document.getElementById('carNumberDropdown');
        const carButton = document.getElementById("carButton");
        const bikeButton = document.getElementById("bikeButton");
        const bikeBoxContainer = document.getElementById('bikeBoxContainer');
        const carBoxContainer = document.getElementById('carBoxContainer');

        function populateDropdown(selectedButton) {
            carNumberDropdown.innerHTML = "";

            userData.forEach(user => {
                const options = selectedButton === carButton ? user.cars : user.bikes;

                for (const option in options) {
                    const optionValue = options[option];
                    const optionElement = document.createElement('option');
                    optionElement.value = optionValue;
                    optionElement.textContent = optionValue;
                    carNumberDropdown.appendChild(optionElement);
                }
            });
        }

        // Initial population based on the active button
        populateDropdown(carButton);

        // Event listener for the carSlots
        carSlots.forEach(slot => {
            slot.addEventListener('click', () => {
                // Check if the slot is booked (orange background or has an image)
                const isBooked = slot.style.backgroundColor === 'orange' || slot.querySelector('img');

                if (isBooked) {
                    // Show the booked slot modal
                    const bookedSlotModal = document.getElementById('bookedSlotModal');
                    bookedSlotModal.style.display = 'block';

                    // Handle close button for the modal
                    const closeBookedSlotModal = document.getElementById('closeBookedSlotModal');
                    closeBookedSlotModal.addEventListener('click', () => {
                        bookedSlotModal.style.display = 'none';
                    });
                } else {
                    // Slot is not booked, proceed with opening the modal
                    modal.style.display = 'block';

                    // Set the slot value in the modal
                    const selectedSlot = slot.textContent;
                    input1.value = selectedSlot;

                    input1.disabled = true;
                    // Clear the previous selection in the dropdown
                    carNumberDropdown.selectedIndex = 0;
                }
            });
        });

        try {
            const response = await fetch('http://localhost:8000/carData');
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const responseBike = await fetch('http://localhost:8000/bikeData');
            if (!responseBike.ok) {
                throw new Error(`Error: ${responseBike.statusText}`);
            }

            // Event listener for the submitBtn
            submitBtn.addEventListener('click', async () => {
                try {
                    const selectedSlot = input1.value;
                    const selectedCarNumber = carNumberDropdown.value;

                    if (!selectedCarNumber) {
                        const validationMessage = document.getElementById('validationMessage');
                        validationMessage.textContent = 'Please select a vehicle number';
                        return; // Do not proceed with submission
                    }

                    // Retrieve first name and last name from URL parameters
                    const urlParams = new URLSearchParams(window.location.search);
                    const firstName = urlParams.get('firstName');
                    const lastName = urlParams.get('lastName');

                    // Determine whether to store data in carData or bikeData based on the active button
                    const activeButton = document.querySelector('.button-container button.active');
                    const dataEndpoint = activeButton === carButton ? 'carData' : 'bikeData';

                    const response = await fetch(`http://localhost:8000/${dataEndpoint}?firstName=${firstName}&lastName=${lastName}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            firstName: firstName,
                            lastName: lastName,
                            slot: selectedSlot,
                            vehicleNumber: selectedCarNumber,
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }

                    const userData = await fetch('http://localhost:3000/users');
                    const users = await userData.json();

                    users.forEach(async (user) => {
                        const vehicleType = activeButton === carButton ? 'cars' : 'bikes';

                        if (user[vehicleType] && Object.values(user[vehicleType]).includes(selectedCarNumber)) {
                            // Remove the vehicle number from the array
                            user[vehicleType] = Object.fromEntries(
                                Object.entries(user[vehicleType]).filter(([key, value]) => value !== selectedCarNumber)
                            );

                            // Update the user's data on the server
                            await fetch(`http://localhost:3000/users/${user.id}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(user),
                            });
                        }
                    });

                    modal.style.display = 'none';

                    const validationMessage = document.getElementById('validationMessage');
            validationMessage.textContent = '';
                } catch (error) {
                    console.error('Error submitting parking data:', error);
                }
            });

        } catch (error) {
            console.error('Error fetching data:', error);
        }

        function updateTotalVehiclesCount(selectedType) {
            const totalCarsCount = document.getElementById('totalCarsCount');
            const totalBikesCount = document.getElementById('totalBikesCount');

            const totalCars = userData.reduce((count, user) => {
                return count + (user.cars ? Object.keys(user.cars).length : 0);
            }, 0);

            const totalBikes = userData.reduce((count, user) => {
                return count + (user.bikes ? Object.keys(user.bikes).length : 0);
            }, 0);

            totalCarsCount.textContent = `-${totalCars} `;
            totalBikesCount.textContent = `-${totalBikes} `;

            // Set the active button based on the selectedType
            const activeButton = selectedType === 'cars' ? carButton : bikeButton;
            toggleActiveButton(activeButton);
            populateDropdown(activeButton);
        }

        // Call the function initially with the default type as 'cars'
        updateTotalVehiclesCount('cars');

        // Event listener for the carButton
        carButton.addEventListener("click", function () {
            toggleActiveButton(carButton);
            populateDropdown(carButton);
            carBoxContainer.style.display = 'flex';
            bikeBoxContainer.style.display = 'none';
            updateTotalVehiclesCount('cars');
        });

        // Event listener for the bikeButton
        let isBikeButtonClicked = false; // Flag to check if the bike button is clicked
        let areBikeSlotsGenerated = false; // Flag to check if bike slots are generated

        bikeButton.addEventListener("click", function () {
            toggleActiveButton(bikeButton);
            populateDropdown(bikeButton);
            carBoxContainer.style.display = 'none';
            bikeBoxContainer.style.display = 'flex';
            updateTotalVehiclesCount('bikes');

            // Check if slots are already generated
            areBikeSlotsGenerated ? null : (isBikeButtonClicked = areBikeSlotsGenerated = true, generateBikeSlots());
        });

        function handleSlotClick(slotElement) {
            // Open the modal
            modal.style.display = 'block';

            // Set the slot value in the modal
            const selectedSlot = slotElement.textContent;
            input1.value = selectedSlot;

            // Clear the previous selection in the dropdown
            carNumberDropdown.selectedIndex = 0;
        }

        async function generateBikeSlots() {
            if (isBikeButtonClicked) {
                try {
                    const response = await fetch('http://localhost:8000/bikeData');
                    if (!response.ok) {
                        throw new Error(`Error: ${response.statusText}`);
                    }

                    const bookedBikeSlots = await response.json();

                    // Function to generate bike slots with IDs A01 to A16, B01 to B16, C01 to C16, D01 to D16
                    function generateBikeSlots(containerId, prefix, bookedBikeSlots) {
                        const bikeSlotsContainer = document.getElementById(containerId);

                        for (let i = 1; i <= 16; i++) {
                            const bikeBox = document.createElement("div");
                            bikeBox.classList.add("bike-box");
                            bikeBox.classList.add(i % 2 === 0 ? "border-right" : "border-left");
                            bikeBox.classList.add(i <= 8 ? "border-top" : "border-bottom");

                            const bikeSlot = document.createElement("div");
                            bikeSlot.classList.add("bike-slot");
                            const slotId = `${prefix}${i.toString().padStart(2, '0')}`;
                            bikeSlot.textContent = slotId;

                            // Check if the slot is already booked and set the initial color
                            const isBooked = bookedBikeSlots.some(booking => booking.slot === slotId);
                            if (isBooked) {
                                // Extract first name and last name from URL parameters
                                const urlParams = new URLSearchParams(window.location.search);
                                const firstName = urlParams.get('firstName');
                                const lastName = urlParams.get('lastName');

                                // Check if first name and last name match the booked slot
                                if (
                                    firstName &&
                                    lastName &&
                                    bookedBikeSlots.some(
                                        booking =>
                                            booking.slot === slotId &&
                                            booking.firstName === firstName &&
                                            booking.lastName === lastName
                                    )
                                ) {
                                    bikeSlot.style.backgroundColor = 'orange';
                                    bikeSlot.style.color = 'white';
                                } else {
                                    // Show an image 
                                    bikeSlot.innerHTML = `<img src="img/race-bike.png" class="bike-slot-img" alt="Booked" />`;
                                    bikeSlot.style.backgroundColor = 'white';
                                }
                            }

                            bikeSlot.addEventListener('click', () => {
                                // Check if the slot is booked (orange background or has an image)
                                const isBooked = bikeSlot.style.backgroundColor === 'orange' || bikeSlot.querySelector('img');

                                if (isBooked) {
                                    // Show the booked slot modal
                                    const bookedSlotModal = document.getElementById('bookedSlotModal');
                                    bookedSlotModal.style.display = 'block';

                                    // Handle close button for the modal
                                    const closeBookedSlotModal = document.getElementById('closeBookedSlotModal');
                                    closeBookedSlotModal.addEventListener('click', () => {
                                        bookedSlotModal.style.display = 'none';
                                    });
                                } else {
                                    // Slot is not booked, proceed with opening the modal
                                    input1.disabled = true;
                                    handleSlotClick(bikeSlot);
                                }
                            });

                            bikeBox.appendChild(bikeSlot);
                            bikeSlotsContainer.appendChild(bikeBox);
                        }
                    }

                    // Call the function to generate bike slots for A01 to A16 with booked slots
                    generateBikeSlots("bikeSlotsContainerA", "A", bookedBikeSlots);

                    // Call the function to generate bike slots for B01 to B16 with booked slots
                    generateBikeSlots("bikeSlotsContainerB", "B", bookedBikeSlots);

                    // Call the function to generate bike slots for C01 to C16 with booked slots
                    generateBikeSlots("bikeSlotsContainerC", "C", bookedBikeSlots);

                    // Call the function to generate bike slots for D01 to D16 with booked slots
                    generateBikeSlots("bikeSlotsContainerD", "D", bookedBikeSlots);
                } catch (error) {
                    console.error('Error fetching bike data:', error);
                }
            }
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        validationMessage.textContent = '';
    });

    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        validationMessage.textContent = '';
    });

    function toggleActiveButton(button) {
        // Remove "active" class from all buttons
        document.querySelectorAll(".button-container button").forEach(btn => {
            btn.classList.remove("active");
        });

        // Add "active" class to the clicked button
        button.classList.add("active");
    }

    const carButton = document.getElementById("carButton");
    const bikeButton = document.getElementById("bikeButton");

    // Add "active" class to the car button by default
    carButton.classList.add("active");

    carButton.addEventListener("click", function () {
        toggleActiveButton(carButton);
    });

    bikeButton.addEventListener("click", function () {
        toggleActiveButton(bikeButton);
    });

    const replaceBtn = document.querySelector('.replace-btn');
    const dataModal = document.getElementById('dataModal');
    const closeDataModal = document.getElementById('closeDataModal');
    const dataTableBody = document.getElementById('dataBody');

    // Event listener for replace button
    replaceBtn.addEventListener('click', async () => {
        try {
            // Determine whether to fetch car or bike data based on the active button
            const activeButton = document.querySelector('.button-container button.active');
            const dataEndpoint = activeButton === carButton ? 'carData' : 'bikeData';

            const response = await fetch(`http://localhost:8000/${dataEndpoint}`);
            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();

            // Clear existing table data
            dataTableBody.innerHTML = '';

            // Populate the modal table with fetched data
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.firstName} ${item.lastName}</td>
                    <td>${item.slot}</td>
                    <td>${item.id}</td>
                    <td>${item.vehicleNumber}</td>
                    <td><button class="delete-btn" data-id="${item.id}">Delete</button></td>
                `;
                dataTableBody.appendChild(row);
            });

            // Show the modal
            dataModal.style.display = 'block';
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    });
    // Event listener for close data modal button
    closeDataModal.addEventListener('click', () => {
        dataModal.style.display = 'none';
    });

    // Event listener for delete buttons in the table
    const confirmDeleteModal = document.getElementById('confirmDeleteModal');
    const messageModal = document.getElementById('messageModal');
    const btnYes = document.getElementById('btnYes');
    const btnNo = document.getElementById('btnNo');
    const btnOk = document.getElementById('btnOk');

    document.addEventListener('click', async function (event) {
        if (event.target.classList.contains('delete-btn')) {
            const itemId = event.target.dataset.id;

            // Extract first name and last name from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const firstName = urlParams.get('firstName');
            const lastName = urlParams.get('lastName');

            // Check if the row has the same name as in the URL
            const rowName = event.target.closest('tr').querySelector('td:first-child').textContent;
            const [rowFirstName, rowLastName] = rowName.split(' ');

            if (firstName === rowFirstName && lastName === rowLastName) {
                // Display the confirmation delete modal
                confirmDeleteModal.style.display = 'block';

                btnYes.addEventListener('click', async () => {
                    try {
                        // Perform delete operation based on the active button
                        const activeButton = document.querySelector('.button-container button.active');
                        const dataEndpoint = activeButton === carButton ? 'carData' : 'bikeData';

                        const deleteResponse = await fetch(`http://localhost:8000/${dataEndpoint}/${itemId}`, {
                            method: 'DELETE',
                        });

                        if (!deleteResponse.ok) {
                            throw new Error(`Error: ${deleteResponse.statusText}`);
                        }

                        // Refresh the data in the modal
                        replaceBtn.click();

                        // Hide the confirmation delete modal
                        confirmDeleteModal.style.display = 'none';
                    } catch (error) {
                        console.error('Error deleting item:', error);
                    }
                });

                btnNo.addEventListener('click', () => {
                    // Hide the confirmation delete modal without performing the delete operation
                    confirmDeleteModal.style.display = 'none';
                });
            } else {
                // Display the message modal
                messageModal.style.display = 'block';

                btnOk.addEventListener('click', () => {
                    // Hide the message modal
                    messageModal.style.display = 'none';
                });
            }
        }
    });
});

function logout() {
    window.location.href = 'login.html';
}