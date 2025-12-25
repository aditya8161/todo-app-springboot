//adduser

let page_base_url = "http://localhost:8080";
let user_base_url = "http://localhost:8080/users";

//================ADD user code start =============
async function addUser(event) {
    // Prevent the form from submitting the traditional way (page reload)
    event.preventDefault();

    // 1. Capture data from the form
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone = document.getElementById('phone').value;

    // 2. Email Format Regex (Standard pattern)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // 3. Run Checks
    if (name === "") {
        alert("Name is required");
    } else if (!emailPattern.test(email)) {
        alert("Please enter a valid email address");
    } else if (password.length < 6) {
        alert("Password must be at least 6 characters long");
    } else {
        // If all checks pass
        console.log("Form is valid! Proceeding...");
        // Proceed with form submission or API call
    }

    // Create the UserDto object
    const userDto = {
        name: name,
        email: email,
        password: password,
        phone: phone
    };

    try {
        // 2. Send the POST request
        const response = await fetch(user_base_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userDto)
        });

        // 3. Handle the response
        if (response.ok) {
            alert("User added successfully!");
            // Redirect to login page
            window.location.href = `${page_base_url}/loginpage`;
        } else {
            // Handle server-side errors (e.g., 400 Bad Request, 500 Server Error)
            const errorData = await response.json();
            alert("Failed to add user: " + (errorData.message || "Unknown error"));
        }
    } catch (error) {
        // Handle network errors
        console.error("Error:", error);
        alert("A network error occurred. Please try again later.");
    }
}

// Attach the function to the form submit event
document.getElementById('addUserForm').addEventListener('submit', addUser);

//================ADD user code end =============

