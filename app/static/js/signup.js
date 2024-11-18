function signup(){
    const contactInput = document.querySelector("#input-contact").value;
    const errorMessage = document.querySelector(".error-message")

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
    const contactInput = document.querySelector("#input-contact").value;
    const rightBox = document.querySelector(".right-box")
    const verifySection = document.querySelector(".verify-section")
    const errorMessage = document.querySelector(".error-message")

    const response = await fetch('/send-code', {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({contactInput})
    })

    const result = await response.json()
    // console.log(result)

    if(result.success){
        rightBox.style.display = "none"
        verifySection.style.display = "flex"
    }else{
        errorMessage.textContent = result.error || "Failed to send code."
    }
}

async function verifyCode() {
    const verificationCodeTyped = document.querySelector("#verification-code").value
    const message = document.querySelector("#message")

    const response = await fetch("/verify-code", {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({verificationCode: verificationCodeTyped})
    })

    const result = await response.json()
    // console.log(result)

    if(result.success){
        message.style.display = "block"
        message.style.color = "green"
        message.textContent = "Successfully signed up."
        window.location.href = "/"
    } else{
        message.style.display = "block"
        message.style.color = "red"
        message.textContent = "Invalid code."
    }

}