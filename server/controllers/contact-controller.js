const { default: mongoose } = require("mongoose");
const UserModel = require("../models/user-model");
const MessageModel = require("../models/message-model");
const SearchContacts = async (req, res) => {
  try {
    const { searchData } = req.body;
    if (searchData === undefined || searchData === null) {
      return res.status(400).send("Search Data is required");
    }
    let sanitizedSearchData = searchData.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(sanitizedSearchData, "i");
    const contacts = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    }).select("-password");
    return res.status(200).send({ contacts });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};
const getContacts = async (req, res) => {
  try {
    let userId = req.userId;
    if (!userId) return res.status(400).send("User Not Found");
    userId = new mongoose.Types.ObjectId(userId);

    const contacts = await MessageModel.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { timeStamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timeStamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({ contacts });
  } catch (err) {
    console.log("Error fetching contacts:", err);
    return res.status(500).send("Internal Server Error");
  }
};
const getAllContacts = async (req, res) => {
  try {
    let user = req.userId;
    if (!user) {
      return res.status(401).send("Unauthorized Access");
    }
    const data = await UserModel.find(
      {
        _id: { $ne: user },
      },
      "firstName lastName _id email"
    );

    const contacts = data.map((d) => ({
      label: d.firstName ? `${d.firstName} ${d.lastName}` : d.email,
      value: d._id,
    }));
    res.status(200).json({ contacts });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).send("Server Error");
  }
};

module.exports.SearchContacts = SearchContacts;
module.exports.getContacts = getContacts;
module.exports.getAllContacts = getAllContacts;
