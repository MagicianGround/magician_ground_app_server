# temp-server
main server temporal

## Endpoints

# User

 - Register --> /user/signup
 - Login --> /user/login
 - Change data --> /user/change
    {
        "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJtZ3BlaXJvbmUyNUBnbWFpbC5jb20iLCJpYXQiOjE3NTY2OTkyMTIsImV4cCI6MTc1Njc4NTYxMn0.9kO9WbX5bnjlYwOIZNKVqhMUYcghNjgrAW-Ny9_IvUk",
        "userId" : 4,
        "prop" : "user_password",
        "newprop" : "DINOsaurio2008"
    }
     - ["username", "email", "user_password", "country", "phone_number"]
 - Delete --> http://localhost:8080/user/delete
    {
        "token" : ""
    }