import { AddIcon, CloseIcon } from "@chakra-ui/icons";
import {
  Badge,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../context/ChatContext";
import axios from "axios";
import UserList from "./UserList";

const AddGroupChat = () => {
  const { user, fetchAgain, setFetchAgain } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [chatName, setChatName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const toast = useToast();

  const handleSearch = async (search) => {
    if (!search) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const url = `/api/users?search=${search}`;
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(url, config);
      const matchedUsers = data.users;
      const filteredUsers = matchedUsers.filter(
        (matchedUser) => matchedUser.name !== user.name
      );
      setSearchResults(filteredUsers);
      setLoading(false);
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
    }
  };
  const addUser = (newUser) => {
    const matchedUser = selectedUsers.find(
      (selectedUser) => selectedUser._id === newUser._id
    );
    if (matchedUser) {
      toast({
        title: "User already added",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setSelectedUsers([...selectedUsers, newUser]);
  };
  const handleDelete = (u) => {
    setSelectedUsers(
      selectedUsers.filter((selectedUser) => selectedUser.name !== u.name)
    );
  };

  const createGroupChat = async () => {
    if (!chatName) {
      toast({
        title: "Please specify chat name",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (selectedUsers.length < 2) {
      toast({
        title: "At least 2 other users are required for a group chat",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    const chatUsers = selectedUsers.map((u) => u._id);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    setIsLoading(true);
    try {
      const { data } = await axios.post(
        "/api/chats/group",
        { chatUsers, chatName },
        config
      );
      toast({
        title: "Group created successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
      setFetchAgain(!fetchAgain);
      onClose();
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsLoading(false);
    }
  };
  return (
    <>
      <Button
        size="sm"
        rightIcon={<AddIcon />}
        whiteSpace="normal"
        onClick={onOpen}
      >
        Create Group Chat
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setSearchResults([]);
          setSelectedUsers([]);
          setChatName("");
          onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Group Chat</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Chat Name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </FormControl>
            <FormControl mt={4} mb="0.5rem">
              <Input
                placeholder="Add users e.g. John, Jane"
                onChange={(e) => handleSearch(e.target.value)}
              />
            </FormControl>
            {selectedUsers.map((u) => {
              return (
                <Badge
                  key={u._id}
                  mr={2}
                  px={2}
                  py={1}
                  my={2}
                  colorScheme="purple"
                  cursor="pointer"
                >
                  {u.name}
                  <CloseIcon pl={1} onClick={() => handleDelete(u)} />
                </Badge>
              );
            })}
            {loading ? (
              <Text mt={2} textAlign="center">
                Loading...
              </Text>
            ) : (
              searchResults.map((searchResult) => {
                return (
                  <UserList
                    key={searchResult._id}
                    user={searchResult}
                    handleClick={addUser}
                  />
                );
              })
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              isLoading={isLoading}
              colorScheme="blue"
              mr={3}
              onClick={createGroupChat}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default AddGroupChat;
