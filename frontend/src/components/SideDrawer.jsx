import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  SkeletonText,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import UserList from "./UserList";
import { ChatState } from "../context/ChatContext";

const SideDrawer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const toast = useToast();
  const { user, fetchAgain, setFetchAgain } = ChatState();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
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
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      setLoading(false);
    }
  };
  const accessChat = async (u) => {
    const userId = u._id;
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const { data } = await axios.post("/api/chats", { userId }, config);
      setFetchAgain(!fetchAgain);
    } catch (error) {
      toast({
        title: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  return (
    <>
      <Tooltip hasArrow label="Search a user by name or e-mail">
        <Button ref={btnRef} variant="ghost" onClick={onOpen}>
          <SearchIcon />
          <Text display={{ base: "none", md: "flex" }} px={4}>
            Search User
          </Text>
        </Button>
      </Tooltip>
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={() => {
          setSearchResults([]);
          onClose();
        }}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Search Users</DrawerHeader>

          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
            </Box>
            {loading ? (
              <SkeletonText noOfLines={6} skeletonHeight={4} />
            ) : (
              searchResults.map((searchResult) => {
                return (
                  <UserList
                    key={searchResult._id}
                    user={searchResult}
                    handleClick={accessChat}
                  />
                );
              })
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
