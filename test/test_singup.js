
const { response } = require("express");

fetch('http://localhost:8080/user/singup/', {
    method:"POST",
    body: JSON.stringify({
        username:"juan",
        email:"juan@gmail.comn",
        user_password:"juansito1234",
        conutry:"Argentina",
        phone_number:"1234534"
    }),
    headers: {
    "Content-type": "application/json; charset=UTF-8",
    },
})
.then((response) => response.json())
.then((json) => console.log(json));