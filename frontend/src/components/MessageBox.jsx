import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Box,
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { ChatState } from "../context/ChatContext";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import EmojiPicker from "emoji-picker-react";
import { GoSmiley } from "react-icons/go";
var socket, sendNotif;
//var typing = false;

const MessageBox = () => {
  const { user, selectedChat, fetchAgain, setFetchAgain } = ChatState();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const toast = useToast();

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  useEffect(() => {
    socket = io("http://localhost:5000/");
    //socket.on("connected", () => setIsConnected(true));
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      setMessages([]);
      const chatId = selectedChat._id;
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/message/${chatId}`, config);
        setMessages(data);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Unable to fetch messages",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchMessages();
    socket.emit("join chat room", { room: selectedChat._id, user });
    return () =>
      socket.emit("leave chat room", { room: selectedChat._id, user });
  }, [selectedChat]);

  const handleSendMessage = (e) => {
    if (
      ((e.type === "keydown" && e.key === "Enter") || e.type === "click") &&
      newMessage &&
      !isSending
    ) {
      const chatId = selectedChat._id;
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      socket.emit("stop typing", selectedChat._id);
      setIsSending(true);
      axios
        .post(
          `/api/message/${chatId}`,
          {
            content: newMessage,
          },
          config
        )
        .then((response) => {
          const message = response.data;
          setMessages([message, ...messages]);
          socket.emit("new message", message);
          setNewMessage("");
          setIsSending(false);
          setFetchAgain(!fetchAgain);
          sendNotif = true;
        })
        .catch((error) => {
          toast({
            title: "Unable to send message",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsSending(false);
        });
    }
  };
  const handleEmojiClick = (emojiObject) => {
    setNewMessage(newMessage + emojiObject.emoji);
  };
  useEffect(() => {
    socket.on("message received", (message) => {
      setMessages([message, ...messages]);
      setFetchAgain(!fetchAgain);
    });

    socket.on("is typing", () => setIsTyping(true));
    socket.on("is not typing", () => setIsTyping(false));
    socket.on("save notifications", async ({ users, message }) => {
      users = users.filter((u) => u !== user._id);

      if (sendNotif && users.length > 0) {
        sendNotif = false;
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        try {
          await axios.post(
            "/api/notifications",
            { users, message, chat: message.chat._id },
            config
          );
        } catch (error) {
          toast({
            title: "Unable to save notification",
            description: error.message,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      }
    });
  });

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (e.target.value) {
      //   if (!typing) {
      socket.emit("typing", selectedChat._id);
      //     typing = true;
      //   }
    } else {
      socket.emit("stop typing", selectedChat._id);
      //    typing = false;
    }
  };

  return (
    <Box
      display="flex"
      flexDir="column"
      bg="#E8E8E8"
      w="95%"
      h="90%"
      m="auto"
      mt={4}
      borderRadius="md"
      position="relative"
    >
      {loading ? (
        <Box
          h="100%"
          w="100%"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="xl" />
        </Box>
      ) : (
        <Box
          h="95%"
          display="flex"
          flexDirection="column-reverse"
          overflowY="auto"
        >
          {messages.map((m, i) => {
            const isSameUser = m.sender._id === user._id;
            var isSameSender = null;
            if (i < messages.length - 1 && !isSameUser) {
              isSameSender = m.sender._id !== messages[i + 1].sender._id;
            }

            return (
              <Box
                key={m._id}
                alignSelf={isSameUser ? "flex-end" : "flex-start"}
                maxW="50%"
                display="flex"
                mt={3}
                mx={selectedChat.isGroupChat ? (isSameSender ? 4 : 12) : 4}
              >
                {selectedChat.isGroupChat && !isSameUser && isSameSender && (
                  <Tooltip label={m.sender.name}>
                    <Avatar src={m.sender.pic} mr={2} mt={1} size="xs" />
                  </Tooltip>
                )}
                <Box
                  bg={isSameUser ? "#BEE3F8" : "#B9F5D0"}
                  p={3}
                  borderRadius="lg"
                >
                  {selectedChat.isGroupChat && !isSameUser && isSameSender && (
                    <Text color="#ca1f7b" fontSize="sm" fontFamily="sans-serif">
                      {m.sender.name}:
                    </Text>
                  )}
                  <Text>{m.content}</Text>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      {isTyping ? (
        <Box display="flex" alignSelf="flex-start" mt={4} ml={4}>
          <Lottie options={defaultOptions} width={70}></Lottie>
        </Box>
      ) : null}

      {showEmojiPicker && (
        <Box zIndex="10" position="absolute" bottom="3.5rem" right="0">
          <EmojiPicker emojiStyle="google" onEmojiClick={handleEmojiClick} />
        </Box>
      )}

      <InputGroup w="97.5%" mx="auto" mt={4} mb="0.5rem">
        <Input
          bg="#d4d4d4"
          minHeight="3rem"
          placeholder="Enter a message"
          value={newMessage}
          onChange={(e) => handleInputChange(e)}
          onKeyDown={(e) => handleSendMessage(e)}
        />

        <InputRightElement>
          <Button
            variant="ghost"
            mt={2}
            mr={2}
            p={0}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <GoSmiley fontSize="1.5rem" />
          </Button>
          <Button
            mt={2}
            mr={16}
            isDisabled={isSending}
            onClick={(e) => handleSendMessage(e)}
          >
            <ChevronRightIcon fontSize="2rem" />
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default MessageBox;
