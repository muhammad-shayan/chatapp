import { Box, Spinner, Text, useToast } from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import axios from "axios";
import { useEffect, useState } from "react";
import ChatList from "./ChatList";
import AddGroupChat from "./AddGroupChat";

const MyChats = () => {
  const { user, selectedChat, fetchAgain, setSelectedChat } = ChatState();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setLoading(true);
        const { data } = await axios.get("/api/chats", config);
        setChats(data);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Error fetching chats",
          description: error.message,
          duration: 5000,
          position: "top",
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchChats();
  }, [fetchAgain]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", lg: "flex" }}
      bg="white"
      borderWidth="1px"
      borderRadius="md"
      height="90vh"
      width={{ base: "100%", lg: "31%" }}
      flexDir="column"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="4rem"
        width="100%"
        p={4}
      >
        <Text fontSize="xl">
          <strong>My Chats</strong>
        </Text>
        <AddGroupChat />
      </Box>
      <Box mt="0.5rem" overflowY="auto">
        {false ? (
          <Box display="flex" justifyContent="center" alignItems="center">
            <Spinner size="xl" />
          </Box>
        ) : (
          chats.map((chat) => {
            return <ChatList key={chat._id} chat={chat}></ChatList>;
          })
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
