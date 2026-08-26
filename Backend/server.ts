import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import app from "./src/app.js";
import connectToDatabase from "./src/config/database.js";

connectToDatabase();

app.listen(3000, "0.0.0.0", () => {
  console.log("Server is running on port 3000");
});
