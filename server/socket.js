const { Server: SocketIoServer } = require("socket.io");
const MessageModel = require("./models/message-model");

const socketSetup = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`User disconnected ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    try {
      const senderSocketId = userSocketMap.get(message.sender);
      const recipientSocketId = userSocketMap.get(message.recipient);

      const createMessage = await MessageModel.create(message);

      const messageData = await MessageModel.findById(createMessage._id)
        .populate("sender", "_id email firstName lastName image color")
        .populate("recipient", "_id email firstName lastName image color");

      if (senderSocketId) {
        io.to(senderSocketId).emit("recieveMessage", messageData);
      }
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("recieveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User ${userId} Connected with ${socket.id}`);
    } else {
      console.log("userId is not provided");
    }

    socket.on("sendMessage", sendMessage);
    socket.on("disconnect", () => disconnect(socket));
  });
};

module.exports = socketSetup;
