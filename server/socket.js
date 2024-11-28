const { Server: SocketIoServer } = require("socket.io");
const MessageModel = require("./models/message-model");
const ChannelModel = require("./models/channel-model");

const socketSetup = (server) => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();
  const activeCallMap = new Map();
  const userCallState = new Map();

  const broadcastUserStatus = (userId, isOnline) => {
    io.emit("user-status-update", { userId, isOnline });
    const onlineUsers = Array.from(userSocketMap.keys());
    io.emit("get-online-users", onlineUsers);
  };

  const disconnect = (socket) => {
    let disconnectedUserId;
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        disconnectedUserId = userId;
        userSocketMap.delete(userId);
        userCallState.delete(userId);

        const activeCall = Array.from(activeCallMap.entries()).find(
          ([_, call]) => call.caller === userId || call.recipient === userId
        );

        if (activeCall) {
          const [callId, call] = activeCall;
          const otherPartyId =
            call.caller === userId ? call.recipient : call.caller;
          const otherPartySocket = userSocketMap.get(otherPartyId);

          if (otherPartySocket) {
            io.to(otherPartySocket).emit("call-ended", {
              callId,
              reason: "User disconnected",
            });
          }

          activeCallMap.delete(callId);
          userCallState.delete(otherPartyId);
        }

        broadcastUserStatus(userId, false);
        break;
      }
    }
    return disconnectedUserId;
  };

  const sendMessage = async (message) => {
    try {
      const createMessage = await MessageModel.create(message);

      const messageData = await MessageModel.findById(createMessage._id)
        .populate("sender", "id email firstName lastName image color")
        .populate("recipient", "id email firstName lastName image color");

      const senderSocketId = userSocketMap.get(message.sender.toString());
      const recipientSocketId = userSocketMap.get(message.recipient.toString());

      if (senderSocketId) {
        io.to(senderSocketId).emit("receiveMessage", messageData);
      }
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("receiveMessage", messageData);
      }
    } catch (error) {
      console.error("Error sending message:", error);
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

      const channel = await ChannelModel.findById(channelId)
        .populate("members")
        .populate("admin");

      if (!channel) {
        throw new Error(`Channel not found: ${channelId}`);
      }

      const finalData = {
        ...messageData._doc,
        channelId: channel._id,
      };

      const allRecipients = [...channel.members, channel.admin].filter(Boolean);

      allRecipients.forEach((recipient) => {
        if (!recipient?._id) return;

        const recipientSocketId = userSocketMap.get(recipient._id.toString());
        if (recipientSocketId) {
          io.to(recipientSocketId).emit("receive-channel-message", finalData);
        }
      });
    } catch (error) {
      console.error("Error sending channel message:", error);
    }
  };

  const handleCallInitiation = async (socket, callData) => {
    const { recipientId, callType } = callData;
    const callerId = socket.handshake.query.userId;
    const callerIdStr = callerId.toString();
    const recipientIdStr = recipientId.toString();
    
    const recipientSocketId = userSocketMap.get(recipientIdStr);
    
    if (!recipientSocketId) {
      socket.emit("call-failed", { reason: "User is offline" });
      return;
    }

    // Check if either user is already in a call
    if (userCallState.get(callerIdStr) || userCallState.get(recipientIdStr)) {
      socket.emit("call-failed", { reason: "User is busy" });
      return;
    }

    const callId = `${callerIdStr}-${recipientIdStr}-${Date.now()}`;

    // Store call state
    activeCallMap.set(callId, {
      caller: callerIdStr,
      recipient: recipientIdStr,
      callType,
      startTime: new Date(),
    });

    // Update user states
    userCallState.set(callerIdStr, callId);
    userCallState.set(recipientIdStr, callId);

    // Send call request to recipient
    io.to(recipientSocketId).emit("incoming-call", {
      callId,
      callerId: callerIdStr,
      callType,
    });
    // Notify caller that the call is ringing
    socket.emit("call-ringing", { callId });

    // Set a timeout for call acceptance
    setTimeout(() => {
      const call = activeCallMap.get(callId);
      if (call && !call.accepted) {
        // Call wasn't accepted within timeout period
        activeCallMap.delete(callId);
        userCallState.delete(callerIdStr);
        userCallState.delete(recipientIdStr);
        
        // Notify both parties
        socket.emit("call-failed", { reason: "No answer" });
        io.to(recipientSocketId).emit("call-ended", { 
          callId,
          reason: "Missed call"
        });
      }
    }, 30000); // 30 second timeout
  };

  const handleCallResponse = (socket, responseData) => {
    const { callId, accepted } = responseData;
    const responderId = socket.handshake.query.userId.toString();
    
    const call = activeCallMap.get(callId);
    if (!call) {
      return;
    }

    const callerSocketId = userSocketMap.get(call.caller);

    if (!accepted) {
      // Call rejected
      io.to(callerSocketId).emit("call-rejected", { callId });
      activeCallMap.delete(callId);
      userCallState.delete(call.caller);
      userCallState.delete(call.recipient);
      return;
    }

    // Mark call as accepted
    call.accepted = true;
    activeCallMap.set(callId, call);

    // Call accepted - notify caller
    io.to(callerSocketId).emit("call-accepted", { callId });
  };

  const handleIceCandidate = (socket, data) => {
    const { callId, candidate } = data;
    const call = activeCallMap.get(callId);

    if (!call) return;

    const userId = socket.handshake.query.userId.toString();
    const targetId = call.caller === userId ? call.recipient : call.caller;
    const targetSocketId = userSocketMap.get(targetId);

    if (targetSocketId) {
      io.to(targetSocketId).emit("ice-candidate", { callId, candidate });
    }
  };

  const handleSdpOffer = (socket, data) => {
    const { callId, sdp } = data;
    const call = activeCallMap.get(callId);

    if (!call) return;

    const recipientSocketId = userSocketMap.get(call.recipient);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit("sdp-offer", { callId, sdp });
    }
  };

  const handleSdpAnswer = (socket, data) => {
    const { callId, sdp } = data;
    const call = activeCallMap.get(callId);

    if (!call) return;

    const callerSocketId = userSocketMap.get(call.caller);
    if (callerSocketId) {
      io.to(callerSocketId).emit("sdp-answer", { callId, sdp });
    }
  };

  const handleEndCall = (socket, data) => {
    const { callId } = data;
    const call = activeCallMap.get(callId);

    if (!call) return;

    const userId = socket.handshake.query.userId.toString();
    const otherPartyId = call.caller === userId ? call.recipient : call.caller;
    const otherPartySocket = userSocketMap.get(otherPartyId);

    if (otherPartySocket) {
      io.to(otherPartySocket).emit("call-ended", { callId });
    }

    // Cleanup call state
    activeCallMap.delete(callId);
    userCallState.delete(call.caller);
    userCallState.delete(call.recipient);
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId) {
      console.warn("Connection attempt without userId");
      return;
    }
    userSocketMap.set(userId.toString(), socket.id);
    broadcastUserStatus(userId, true);

    socket.on("sendMessage", sendMessage);
    socket.on("send-channel-message", channelMessage);

    socket.on("initiate-call", (data) => handleCallInitiation(socket, data));
    socket.on("call-response", (data) => handleCallResponse(socket, data));
    socket.on("ice-candidate", (data) => handleIceCandidate(socket, data));
    socket.on("sdp-offer", (data) => handleSdpOffer(socket, data));
    socket.on("sdp-answer", (data) => handleSdpAnswer(socket, data));
    socket.on("end-call", (data) => handleEndCall(socket, data));

    socket.on("disconnect", () => disconnect(socket));
  });
};

module.exports = socketSetup;