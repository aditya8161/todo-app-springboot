const authStatus = document.getElementById('authStatus').value;
const userId = document.getElementById("userId").value;

if (authStatus === "true") {
    window.location.href = "http://localhost:8080/loginpage";
}else{
    
}
let page_base_url = "http://localhost:8080";
let user_base_url = "http://localhost:8080/users";


//===========Change-Password of User==================
function changePassword() {
    if (!userId) {
        window.location.href = "http://localhost:8080/loginpage";

        return;
    }

    let currentPassword = document.getElementById("currentPassword").value;
    let newPassword = document.getElementById("newPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    // Validation rules
    const lengthValid = newPassword.length >= 6 && newPassword.length <= 15;
    const hasLetter = /[a-zA-Z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);

    if (!lengthValid || !hasLetter || !hasNumber) {
        alert("Password must be 6–15 characters and include letters and numbers.");
        return;
    }

    if(newPassword !== confirmPassword) {
        alert("New Password and Confirm Password do not match");
        return;
    }

    if (!currentPassword || !newPassword) {
        alert("Please fill all fields");
        return;
    }

    let requestBody = {
        userId: userId,
        currentPassword: currentPassword,
        newPassword: newPassword
    };

    fetch(user_base_url + "/change-password", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    })
    .then(response => {
        if (!response.ok) {
            return response.text().then(err => 
                {
                     throw err;
                 });
        }
         return response.json();
    })
    .then(data => {
        alert("Password changed successfully");
        window.location.href = "http://localhost:8080/profile";
        console.log(data);
    })
    .catch(error => {
//        alert(error.message);
        alert("Current Password is wrong...!")
        console.error(error);
    });
}

//===========Password strenth check ===============
function checkPasswordStrength() {
    const password = document.getElementById("newPassword").value;
    const strengthText = document.getElementById("passwordStrength");

    let strength = 0;

    // Length check
    if (password.length >= 6 && password.length <= 15) strength++;

    // Alphabet check
    if (/[a-zA-Z]/.test(password)) strength++;

    // Number check
    if (/[0-9]/.test(password)) strength++;

    // Special character check (optional)
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    // Strength display
    if (password.length === 0) {
        strengthText.textContent = "";
    } else if (strength <= 2) {
        strengthText.textContent = "Password Strength: Weak";
        strengthText.style.color = "red";
    } else if (strength === 3) {
        strengthText.textContent = "Password Strength: Good";
        strengthText.style.color = "orange";
    } else {
        strengthText.textContent = "Password Strength: Strong";
        strengthText.style.color = "green";
    }
}
