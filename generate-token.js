const jwt = require("jsonwebtoken");

const token = jwt.sign(
  {
    id: 1,
    username: "admin"
  },
  "secretku", // ini secret key
  { expiresIn: "1h" }
);

console.log("TOKEN BARU:");
console.log(token);