const MessageModel = require("../models/message-model");

module.exports.getMessages = async (req, res) => {
  try {
    const userSender = req.userId;
    const userReciever = req.body._id;
    if (!userSender || !userReciever) {
      return res.status(400).send("Both users are required");
    }

    const allMessages = await MessageModel.find({
      $or: [
        { sender: userSender, recipient: userReciever },
        { sender: userReciever, recipient: userSender },
      ],
    }).sort({ timeStamp: 1 });

    return res.status(200).json({ allMessages });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
module.exports.uploadFiles = async (req, res) => {
  try {
    console.log(req.body.attachmentUrl);
    return res.status(200).json({name:"hello"})
  } catch (err) {
    return res.status(500).send("Internal Server Problem");
  }
};
