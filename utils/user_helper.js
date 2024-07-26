import User from "../models/user.js";

const initialUsers = [
  {
    username: "michael",
    name: "Michael Chan",
    password: "michael1",
  },
];

const nonExistingId = async () => {
  const user = new User(initialUsers[0]);
  await user.save();
  await user.deleteOne();

  return user._id.toString();
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((user) => user.toJSON());
};

export default {
  initialUsers,
  nonExistingId,
  usersInDb,
};
