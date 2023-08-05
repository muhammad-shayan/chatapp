import { Box, Text } from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import Messages from "./Messages";

const ChatBox = () => {
  const { selectedChat, setSelectedChat } = ChatState();

  return (
    <Box
      display={{ base: selectedChat ? "flex" : "none", lg: "flex" }}
      flexDir="column"
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      height="90vh"
      width={{ base: "100%", lg: "68%" }}
    >
      {!selectedChat ? (
        <Text
          fontSize="4xl"
          width="100%"
          height="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          Click on a user to start chatting
        </Text>
      ) : (
        <Messages />
      )}
    </Box>
  );
};

export default ChatBox;
