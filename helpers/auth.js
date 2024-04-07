const users = [{
    username: "user",
    password: "password"
}];


function validateUser(userName, password) {
    return (userName === users[0].username && password === users[0].password);
}
module.exports = { validateUser };