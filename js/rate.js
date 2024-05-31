const form = document.querySelector('form');

const name = document.getElementById("name");
const email = document.getElementById("email");
const comments = document.getElementById("comments");

function getSelectedRating() {
    const ratings = document.getElementsByName("rating");
    for (const rating of ratings) {
        if (rating.checked) {
            return rating.value;
        }
    }
    return null;
}

function sendEmail() {
    const selectedRating = getSelectedRating();
    const bodyMessage = `Name: ${name.value}<br> Email: ${email.value}<br> Rating: ${selectedRating}<br> Comment: ${comments.value}`;

    Email.send({
        Host: "smtp.elasticemail.com",
        Username: "desvinaku@gmail.com",
        Password: "E1FF1682F242E7FFF03D67C46F01022B68DA",
        To: 'desvinaku@gmail.com',
        From: "desvinaku@gmail.com",
        Subject: "Feedback Form Submission",
        Body: bodyMessage
    }).then(
        message => {
            if (message == "OK") {
                alert("Thank you for your feedback!");
            }
        }
    );
}

function checkInputs() {
    const items = document.querySelectorAll(".item");

    for (const item of items) {
        if (item.value == "") {
            item.classList.add("error");
            item.parentElement.classList.add("error");
        }

        if (items[1].value != "") {
            checkEmail();
        }

        items[1].addEventListener("keyup", () => {
            checkEmail();
        });

        item.addEventListener("keyup", () => {
            if (item.value != "") {
                item.classList.remove("error");
                item.parentElement.classList.remove("error");
            } else {
                item.classList.add("error");
                item.parentElement.classList.add("error");
            }
        });
    }
}

function checkEmail() {
    const emailRegex = /^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,3})(\.[a-z]{2,3})?$/;
    const errorTxtEmail = document.querySelector(".error-txt.email");

    if (!email.value.match(emailRegex)) {
        email.classList.add("error");
        email.parentElement.classList.add("error");

        if (email.value != "") {
            errorTxtEmail.innerText = "Enter a valid email address";
        } else {
            errorTxtEmail.innerText = "Email address can't be blank";
        }
    } else {
        email.classList.remove("error");
        email.parentElement.classList.remove("error");
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    checkInputs();

    const selectedRating = getSelectedRating();
    if (!name.classList.contains("error") && !email.classList.contains("error") && selectedRating && !comments.classList.contains("error")) {
        sendEmail();

        form.reset();
        return false;
    } else {
        alert("Please fill out all fields correctly.");
    }
});

