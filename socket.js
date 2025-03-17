const socketIo = (io) => {

  //Store connected users with their room information using socket.id as their key
  const connectedUsers = new Map();
  //Handle new socket connections
  io.on("connection", (socket) => {

    //Get user from authentication
    const user = socket.handshake.auth.user;
    console.log("User connected", user?.username);



    //Start: Join room Handler
    socket.on("join room", (groupId) => {
      //Add socket to the specified room
      socket.join(groupId);
      //Store user and room info in connectedUsers map
      connectedUsers.set(socket.id, { user, room: groupId });
      //Get list of all users currently in the room
      const usersInRoom = Array.from(connectedUsers.values())
        .filter((u) => u.room === groupId)
        .map((u) => u.user);
      // Emit updated users list to all clients in the room
      io.in(groupId).emit("users in room", usersInRoom);
      // Broadcast join notification to all other users in the room
      socket.to(groupId).emit("notification", {
        type: "USER_JOINED",
        message: `${user?.username} has joined`,
        user: user,
      });
    });
    //End: Join room Handler





    //Start: Leave room Handler
    //Triggered when user manually leaves a room
    socket.on("leave room", (groupId) => {
      console.log(`${user?.username} leaving room:`, groupId);
      //Remove socket from the room
      socket.leave(groupId);
      if (connectedUsers.has(socket.id)) {
        //Remove user from connected users and notify others
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left", user?._id);
      }
    });
    //End: Leave room Handler






    //Start: New Message Handler
    //Triggered when user sends a new message
    socket.on("new message", (message) => {
      // Broadcast message to all other users in the room
      socket.to(message.groupId).emit("message received", message);
    });
    //End: New Message Handler




    //Start: Disconnect Handler
    //Triggered when user closes the connection
    socket.on("disconnect", () => {
      console.log(`${user?.username} disconnected`);
      if (connectedUsers.has(socket.id)) {
        // Get user's room info before removing
        const userData = connectedUsers.get(socket.id);
        //Notify others in the room about user's departure
        socket.to(userData.room).emit("user left", user?._id);
        //Remove user from connected users
        connectedUsers.delete(socket.id);
      }
    });
    //End: Disconnect Handler





    //Start: Typing Indicator
    //Triggered when user starts typing
    socket.on("user typing", ({ groupId, username }) => {
      //Broadcast typing status to other users in the room
      socket.to(groupId).emit("user typing", { username });
    });

    socket.on("user stop typing", ({ groupId }) => {
      //Broadcast stop typing status to other users in the room
      socket.to(groupId).emit("user stop typing", { username: user?.username });
    });
    //End: Typing Indicator



  });
};

module.exports = socketIo;
