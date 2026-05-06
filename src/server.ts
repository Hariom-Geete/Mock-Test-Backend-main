import http
from "http";

import app
from "./app.js";

import connectDB
from "./config/db.config.js";

import {
  initSocket
} from "./config/socket.config.js";

const PORT =
  process.env.PORT || 5000;

// ✅ CONNECT DATABASE
connectDB();

// ✅ CREATE SERVER
const server =
  http.createServer(app);

// ✅ INIT SOCKET
initSocket(server);

// ✅ START SERVER
server.listen(PORT, () => {

  console.log(

    `🚀 Server running on port ${PORT}`
  );
});