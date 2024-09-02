const UserModel = require("../models/user-model");
const SearchContacts = async (req, res) => {
  try {
    const { searchData } = req.body;
    if (searchData === undefined || searchData === null) {
      return res.status(400).send("Search Data is required");
    }
    let sanitizedSearchData = searchData.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // console.log(sanitizedSearchData);
    const regex = new RegExp(sanitizedSearchData, "i");

    const contacts = await UserModel.find({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] },
      ],
    }).select('-password');
    return res.status(200).send({ contacts });
  } catch (err) {
    return res.status(500).send("Internal Server Error");
  }
};

module.exports.SearchContacts = SearchContacts;
