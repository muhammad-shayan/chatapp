import { Box, Text, useToast } from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import EditModal from "./EditModal";
import { getSingleChatUser } from "../helper/helperFunc";
import { useState } from "react";
import MessageBox from "./MessageBox";
import axios from "axios";

const Messages = () => {
  const { user, selectedChat, setSelectedChat, fetchAgain, setFetchAgain } =
    ChatState();
  const [displayName, setDisplayName] = useState(selectedChat.chatName);
  const toast = useToast();
  const handleDelete = async () => {
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.delete(`/api/chats/${selectedChat._id}`, config);
      setSelectedChat("");
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: "Unable to delete chat",
        status: "error",
        isClosable: true,
        duration: 5000,
      });
    }
  };
  return (
    <>
      <Box
        width="100%"
        height="3rem"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
      >
        <Box display="flex" alignItems="center">
          <ArrowBackIcon
            display={{ base: "flex", lg: "none" }}
            fontSize="2xl"
            m={2}
            onClick={() => setSelectedChat("")}
            cursor="pointer"
          />
          <Text mx={4} my={2} fontSize="2xl">
            <strong>
              {selectedChat.isGroupChat
                ? displayName
                : getSingleChatUser(selectedChat.users, user).name}
            </strong>
          </Text>
        </Box>
        <Box mx={4} my={2} size="md">
          {selectedChat.isGroupChat ? (
            <EditModal
              displayName={displayName}
              setDisplayName={setDisplayName}
            />
          ) : (
            <ProfileModal
              User={getSingleChatUser(selectedChat.users, user)}
              handleDelete={handleDelete}
            />
          )}
        </Box>
      </Box>
      <MessageBox />
    </>
  );
};

export default Messages;
