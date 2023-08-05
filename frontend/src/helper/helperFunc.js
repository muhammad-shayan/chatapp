export const getSingleChatUser = (users, user) => {
  if (users[0]._id === user._id) return users[1];
  else return users[0];
};

// export const updateNotification = async (user) => {

// }
