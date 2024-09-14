const { Server: SocketIoServer } = require("socket.io");
const MessageModel = require("./models/message-model");
const ChannelModel = require("./models/channel-model");

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
    // console.log(`User disconnected ${socket.id}`);
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
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

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
  const channelMessage = async (message) => {
    const { channelId, sender, content, file, messageType } = message;
    try {
      const createMessage = await MessageModel.create({
        sender,
        recipient: null,
        content,
        messageType,
        file,
        timeStamp: new Date(),
      });

      const messageData = await MessageModel.findById(createMessage._id)
        .populate("sender", "id email firstName lastName color image")
        .exec();

      await ChannelModel.findByIdAndUpdate(channelId, {
        $push: { messages: createMessage._id },
      });

      const channel = await ChannelModel.findById(channelId).populate(
        "members"
      ).populate("admin");

      if (channel) {
        const finalData = { ...messageData._doc, channelId: channel._id };
        
        // Emit to all members, including the admin
        const allRecipients = [...channel.members, channel.admin];
        
        allRecipients.forEach((recipient) => {
          if (recipient && recipient._id) {
            const recipientSocketId = userSocketMap.get(recipient._id.toString());
            if (recipientSocketId) {
              io.to(recipientSocketId).emit("receive-channel-message", finalData);
            } else {
              console.warn(`Socket ID not found for recipient ${recipient._id.toString()}`);
            }
          } else {
            console.warn(`Invalid recipient or missing _id for recipient in channel ${channelId}`);
          }
        });
      } else {
        console.warn(`Channel not found for channel ID ${channelId}`);
      }
    } catch (error) {
      console.error("Error sending channel message:", error.message);
    }
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId, socket.id);
    } else {
      console.log("userId is not provided");
    }
    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", channelMessage);

    socket.on("disconnect", () => disconnect(socket));
  });
};

module.exports = socketSetup;
