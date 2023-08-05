import { Box } from "@chakra-ui/react";
import ChatBox from "../components/ChatBox";
import Header from "../components/Header";
import MyChats from "../components/MyChats";
import { ChatState } from "../context/ChatContext";

const Chatpage = () => {
  const { user } = ChatState();

  return (
    <>
      {user && <Header />}
      <Box display="flex" justifyContent="space-between" mt="1rem" px="1rem">
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>
    </>
  );
};

export default Chatpage;
