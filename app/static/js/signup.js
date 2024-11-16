function signup(){
    const contactInput = document.querySelector("#input-contact").value;
    const errorMessage = document.querySelector(".error-message")
    const signupContainer = document.querySelector(".signup-container")
    const rightBox = document.querySelector(".right-box")
    const verifySection = document.querySelector(".verify-section")

    if(contactInput == ""){
        errorMessage.style.display = "block"
        errorMessage.textContent = "The input field is empty."
    } else if(isNaN(contactInput)){
        errorMessage.style.display = "block"
        errorMessage.textContent = "Please enter a valid number."
    } else{
        sendCode()
    }
}

async function sendCode(){
    const response = await fetch('/send-code', {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({contactInput})
    })

    const result = await response.json()
}