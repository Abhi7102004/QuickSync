const { default: mongoose } = require("mongoose");
const channelModel = require("../models/channel-model");
const UserModel = require("../models/user-model");
const ChannelModel = require("../models/channel-model");

const createChannel = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const admin = await UserModel.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin not found");
    }
    const validMembers = await UserModel.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Invalid User Found");
    }

    const newChannel = await channelModel.create({
      name,
      members,
      admin: userId,
    });
    return res.status(200).send({ newChannel });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
const getUserChannels = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await ChannelModel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });
    return res.status(200).json({ channels });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const channel = await ChannelModel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName image color _id email",
      },
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }
    const messages = channel.messages || [];
    // console.log(messages)
    return res.status(200).json({ messages });
  } catch (err) {
    console.error("Error in getChannelMessages:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.createChannel = createChannel;
module.exports.getUserChannels = getUserChannels;
module.exports.getChannelMessages=getChannelMessages;
