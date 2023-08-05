import { Box, Text, useToast } from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import { getSingleChatUser } from "../helper/helperFunc";
import NotificationBadge from "react-notification-badge/lib/components/NotificationBadge";
import { Effect } from "react-notification-badge";
import axios from "axios";

const ChatList = ({ chat }) => {
  const {
    user,
    selectedChat,
    setSelectedChat,
    notifications,
    setNotifications,
  } = ChatState();
  const toast = useToast();
  const handleSelectedChat = async () => {
    if (selectedChat._id === chat._id) {
      setSelectedChat("");
    } else {
      setSelectedChat(chat);

      if (notifications) {
        const filteredNotifications = notifications.filter(
          (notif) => notif.chat._id !== chat._id
        );
        if (filteredNotifications.length < notifications.length) {
          setNotifications(filteredNotifications);
          try {
            const config = {
              headers: {
                "Content-type": "application/json",
                Authorization: `Bearer ${user.token}`,
              },
            };
            await axios.put(`/api/notifications/${chat._id}`, {}, config);
          } catch (error) {
            toast({
              title: "Unable to update notifications",
              description: error.message,
              status: "error",
              isClosable: true,
              duration: 5000,
            });
          }
        }
      }
    }
  };

  return (
    <Box
      width="90%"
      height="4rem"
      bg={selectedChat._id === chat._id ? "#38B2AC" : "#E8E8E8"}
      color={selectedChat._id === chat._id ? "white" : "black"}
      _hover={{ bg: "#38B2AC", color: "white", cursor: "pointer" }}
      borderWidth="1px"
      borderRadius="md"
      display="flex"
      //flexDirection="column"
      justifyContent="space-between"
      mt="0.5rem"
      px="0.5rem"
      mx="auto"
      onClick={handleSelectedChat}
    >
      <Box width="80%" display="flex" flexDirection="column">
        <Text mt="0.5rem">
          <strong>
            {chat.isGroupChat
              ? chat.chatName
              : getSingleChatUser(chat.users, user).name}
          </strong>
        </Text>
        <Text fontSize="sm" overflow="hidden">
          {chat.latestMessage ? (
            <>
              <strong>
                {chat.isGroupChat ? (
                  `${chat.latestMessage.sender.name} :`
                ) : (
                  <>
                    {chat.latestMessage.sender._id === user._id ? "Me: " : null}
                  </>
                )}{" "}
              </strong>
              {chat.latestMessage.content}
            </>
          ) : null}
        </Text>
      </Box>
      <Box mt={6} mr={2}>
        {notifications.length > 0 &&
          notifications.filter((notif) => notif.chat._id === chat._id).length >
            0 && (
            <NotificationBadge
              count={
                notifications.filter((notif) => notif.chat._id === chat._id)
                  .length
              }
              effect={Effect.SCALE}
            />
          )}
      </Box>
    </Box>
  );
};

export default ChatList;
