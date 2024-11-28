const { default: mongoose } = require("mongoose");
const UserModel = require("../models/user-model");
const MessageModel = require("../models/message-model");
const SearchContacts = async (req, res) => {
  try {
    const { searchData } = req.body;
    if (searchData === undefined || searchData === null) {
      return res.status(400).json({
        message: "Search Data is required",
        success: false,
      });
    }
    let sanitizedSearchData = searchData.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(sanitizedSearchData, "i");
    const contacts = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    }).select("-password");
    return res.status(200).json({ contacts, success: true });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
    });
  }
};
const getContacts = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const contacts = await MessageModel.aggregate([
      // Step 1: Find all messages where user is either sender or recipient
      {
        $match: {
          $or: [
            { sender: userId }, 
            { recipient: userId }
          ]
        }
      },

      // Step 2: For each conversation, get the other person's ID and latest message time
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",  // If user is sender, get recipient
              else: "$sender"      // If user is recipient, get sender
            }
          },
          lastMessageTime: { $first: "$timeStamp" }  // Get most recent message time
        }
      },

      // Step 3: Get contact's user information
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo"
        }
      },

      // Step 4: Flatten the contactInfo array
      {
        $unwind: "$contactInfo"
      },

      // Step 5: Select only the fields we need
      {
        $project: {
          contactId: "$_id",
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          image: "$contactInfo.image",
          color: "$contactInfo.color"
        }
      },

      // Step 6: Sort by most recent message
      {
        $sort: { 
          lastMessageTime: -1 
        }
      }
    ]);

    return res.status(200).json({
      contacts,
      success:true
    });

  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      message: "Failed to fetch contacts",
      success:false
    });
  }
};
const getAllContacts = async (req, res) => {
  try {
    let user = req.userId;
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
    res.status(200).json({ contacts,success:true });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Server Error"
    });
  }
};

module.exports.SearchContacts = SearchContacts;
module.exports.getContacts = getContacts;
module.exports.getAllContacts = getAllContacts;
