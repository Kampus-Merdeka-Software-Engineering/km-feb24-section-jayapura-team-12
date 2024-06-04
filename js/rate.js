document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
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
    const bodyMessage = `
        <div style='width:100%; height: 100%; display:flex;'>
            <div style='width:40%; margin: 0 auto; padding: 2rem 3rem; border: 1px solid #cbcbcb; border-radius: 5px;'>
                <div style='text-align:center'>
                    <h2 style='font-size:25px; margin:0;'>Feedback From Users</h2> 
                    <h3 style='font-size:18px;margin-top: 0;'>for Dashboard Website</h3>
                </div>
                <hr>
                <div>
                    <p style='font-size:15px;'><strong>Name:</strong> ${name.value}</p>
                    <p style='font-size:15px;'><strong>Email:</strong> ${email.value}</p>
                    <p style='font-size:15px;'><strong>Rating:</strong> ${selectedRating}</p>
                    <p style='font-size:15px;'><strong>Comment:</strong> ${comments.value}</p>
                </div>
                <hr>
                <div style='display: flex; width: fit-content; margin: 0 auto; margin-top: 1.2rem'>
                    <img src='https://storage.googleapis.com/kampusmerdeka_kemdikbud_go_id/mitra/mitra_6cd71e6c-9e7c-4146-8ffd-e1a3b18af955.png'
                    width=auto height=50px>
                    <p style='font-size:15px;'>Team 12 Jayapura</p>
                </div>
            </div>
        </div>
        
    `;

    Email.send({
      SecureToken: "4cfd3fa4-5a20-420f-8075-5698e7b34b74",
      Username: "team12.jayapura@gmail.com",
      Password: "2D94D22AE87CA34E545082E14A929F96C585",
      To: "team12.jayapura@gmail.com",
      From: "team12.jayapura@gmail.com",
      Subject: "Feedback Form",
      Body: bodyMessage,
    }).then((message) => {
      console.log(message);
      if (message === "OK") {
        Swal.fire({
          title: "Success!",
          text: "Thankyou for the feedback!",
          icon: "success",
          background: "#1f2229",
          confirmButtonText: "Done",
          confirmButtonColor: "rgba(75, 192, 192, 1)",
        });
      } else {
        Swal.fire({
          title: "Failed!",
          text: "Something Wrong!",
          icon: "error",
          background: "#1f2229",
          confirmButtonText: "Back",
          confirmButtonColor: "rgba(75, 192, 192, 1)",
        });
      }
    });
  }

  function checkInputs() {
    const items = document.querySelectorAll(".item");

    for (const item of items) {
      if (item.value === "") {
        item.classList.add("error");
        item.parentElement.classList.add("error");
      } else {
        item.classList.remove("error");
        item.parentElement.classList.remove("error");
      }
    }

    checkEmail();
  }

  function checkEmail() {
    const emailRegex =
      /^([a-z\d.-]+)@([a-z\d-]+)\.([a-z]{2,3})(\.[a-z]{2,3})?$/;
    const errorTxtEmail = document.querySelector(".error-txt.email");

    if (!email.value.match(emailRegex)) {
      email.classList.add("error");
      email.parentElement.classList.add("error");

      if (email.value !== "") {
        errorTxtEmail.innerText = "Enter a valid email address";
      } else {
        errorTxtEmail.innerText = "Email address can't be blank";
      }
    } else {
      email.classList.remove("error");
      email.parentElement.classList.remove("error");
      errorTxtEmail.innerText = ""; // Clear error message
    }
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    checkInputs();

    const selectedRating = getSelectedRating();
    if (
      !name.classList.contains("error") &&
      !email.classList.contains("error") &&
      selectedRating &&
      !comments.classList.contains("error")
    ) {
      sendEmail();
      form.reset();
    } else {
      Swal.fire({
        title: "Failed!",
        text: "Please fill out all fields correctly!",
        icon: "error",
        background: "#1f2229",
        confirmButtonText: "Back",
        confirmButtonColor: "rgba(75, 192, 192, 1)",
      });
    }
  });

  email.addEventListener("keyup", checkEmail);
  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("keyup", () => {
      if (item.value !== "") {
        item.classList.remove("error");
        item.parentElement.classList.remove("error");
      } else {
        item.classList.add("error");
        item.parentElement.classList.add("error");
      }
    });
  });
});
