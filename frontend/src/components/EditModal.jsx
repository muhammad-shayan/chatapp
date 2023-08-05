import { CloseIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Button,
  IconButton,
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
import { ChatState } from "../context/ChatContext";
import axios from "axios";
import { useEffect, useState } from "react";
import UserList from "./UserList";

const EditModal = ({ displayName, setDisplayName }) => {
  const { user, selectedChat, setSelectedChat, fetchAgain, setFetchAgain } =
    ChatState();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const isGroupAdmin = user._id === selectedChat.groupAdmin._id;
  const [selectedUsers, setSelectedUsers] = useState(selectedChat.users);
  const [chatName, setChatName] = useState("");

  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    setDisplayName(selectedChat.chatName);
    setSelectedUsers(selectedChat.users);
  }, [selectedChat]);
  const handleDelete = async () => {
    if (isGroupAdmin) {
      try {
        const groupChatId = selectedChat._id;
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };
        setIsLoading(true);
        await axios.delete(`/api/chats/group/${groupChatId}`, config);
        toast({
          title: "Group deleted successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setSelectedChat("");
        setIsLoading(false);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    } else {
      const users = selectedUsers.filter(
        (selectedUser) => selectedUser._id !== user._id
      );
      const groupChatId = selectedChat._id;
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      setIsLoading(true);
      try {
        await axios.put(
          "/api/chats/leavegroup",
          { groupChatId, users },
          config
        );

        toast({
          title: "Group left successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setSelectedChat("");
        setIsLoading(false);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
    onClose();
  };
  const handleRemoveUser = async (u) => {
    const users = selectedUsers.filter(
      (selectedUser) => selectedUser._id !== u._id
    );
    const groupChatId = selectedChat._id;
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    setIsLoading(true);
    try {
      await axios.put("/api/chats/group", { groupChatId, users }, config);
      toast({
        title: "User removed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setSelectedUsers(users);
      setIsLoading(false);
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

  const handleEditChatName = async (chatName) => {
    const groupChatId = selectedChat._id;
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    setIsUpdating(true);
    try {
      await axios.put("/api/chats/group", { groupChatId, chatName }, config);
      toast({
        title: "Group Name edited successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setDisplayName(chatName);
      setFetchAgain(!fetchAgain);
      setIsUpdating(false);
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsUpdating(false);
    }
  };

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
  const handleAddUser = async (newUser) => {
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
    const users = [...selectedUsers, newUser];
    const groupChatId = selectedChat._id;
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    setIsUpdating(true);
    try {
      await axios.put("/api/chats/group", { groupChatId, users }, config);
      toast({
        title: "User added successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setSelectedUsers(users);
      setIsUpdating(false);
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setIsUpdating(false);
    }
  };

  return (
    <>
      <IconButton
        size="lg"
        onClick={onOpen}
        icon={<ViewIcon fontSize="1.5rem" />}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            justifyContent="center"
            alignItems="center"
            fontSize="4xl"
          >
            {displayName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUsers.map((u) => {
              return (
                <Badge
                  key={u._id}
                  mr={2}
                  px={2}
                  py={1}
                  my={1}
                  colorScheme="purple"
                  cursor="pointer"
                >
                  <Text>
                    {u.name}
                    {selectedChat.groupAdmin._id === u._id ? (
                      <Text as="span" fontSize="0.6rem" color="blue">
                        {" "}
                        admin
                      </Text>
                    ) : (
                      isGroupAdmin && (
                        <CloseIcon pl={1} onClick={() => handleRemoveUser(u)} />
                      )
                    )}
                  </Text>
                </Badge>
              );
            })}
            {isGroupAdmin ? (
              <>
                <Box display="flex" mt={2}>
                  <Input
                    placeholder="Chat Name"
                    value={chatName}
                    onChange={(e) => setChatName(e.target.value)}
                    mr={2}
                  />
                  <Button
                    colorScheme="green"
                    isLoading={isUpdating}
                    onClick={() => handleEditChatName(chatName)}
                  >
                    Update
                  </Button>
                </Box>
              </>
            ) : null}
            {isGroupAdmin ? (
              <>
                <Box mt={2}>
                  <Input
                    placeholder="Add users e.g. John, Jane"
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </Box>
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
                        handleClick={handleAddUser}
                      />
                    );
                  })
                )}
              </>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="red"
              mr={3}
              onClick={handleDelete}
              isLoading={isLoading}
            >
              {isGroupAdmin ? "Delete Group" : "Leave Group"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditModal;
