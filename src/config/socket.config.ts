import {
  Server
} from "socket.io";

let io: Server;

// ✅ USER → SOCKET MAP
const userSocketMap =
  new Map<string, string>();

// 🚀 INIT SOCKET
export const initSocket =
  (server: any) => {

    io = new Server(server, {

      cors: {

        origin:
          "http://localhost:5173",

        credentials: true,
      },

      transports: [
        "websocket",
        "polling"
      ],

      pingTimeout: 60000,

    });

    io.on(

      "connection",

      (socket) => {

        console.log(

          "✅ Socket connected:",

          socket.id
        );

        // 🚀 REGISTER USER
        socket.on(

          "register",

          (userId: string) => {

            userSocketMap.set(

              userId,

              socket.id
            );

            console.log(

              `User registered: ${userId}`
            );
          }
        );

        // ❌ DISCONNECT
        socket.on(

          "disconnect",

          () => {

            console.log(

              "❌ Socket disconnected:",

              socket.id
            );

            // REMOVE USER
            for (
              const [

                userId,

                socketId

              ]

              of userSocketMap.entries()
            ) {

              if (
                socketId ===
                socket.id
              ) {

                userSocketMap.delete(
                  userId
                );

                break;
              }
            }
          }
        );
      }
    );

    return io;
  };

// ✅ GET IO INSTANCE
export const getIO =
  () => {

    if (!io) {

      throw new Error(
        "Socket.io not initialized"
      );
    }

    return io;
  };

// ✅ GET USER SOCKET
export const getUserSocket =
  (userId: string) => {

    return userSocketMap.get(
      userId
    );
  };