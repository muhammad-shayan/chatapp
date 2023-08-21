import {
  Avatar,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  useToast,
} from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import ProfileModal from "./ProfileModal";
import SideDrawer from "./SideDrawer";
import { ChatState } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { Effect } from "react-notification-badge";
import NotificationBadge from "react-notification-badge";
import axios from "axios";
var socket;
const Header = () => {
  const {
    user,
    setUser,
    setSelectedChat,
    notifications,
    setNotifications,
    fetchAgain,
    setFetchAgain,
  } = ChatState();
  const toast = useToast();
  const navigate = useNavigate();
  useEffect(() => {
    socket = io();
    if (user) socket.emit("login", user);
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      try {
        const { data } = await axios.get("/api/notifications/", config);
        setNotifications(data.map((d) => d.message));
      } catch (error) {
        toast({
          title: "Unable to fetch notifications",
          description: error.message,
          status: "error",
          isClosable: true,
          duration: 5000,
        });
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    socket.on("notification", (message) => {
      setNotifications([message, ...notifications]);

      setFetchAgain(!fetchAgain);
    });
  });
  const handleLogout = () => {
    socket.emit("logout", user);
    localStorage.removeItem("user");
    setUser("");
    setSelectedChat("");
    navigate("/");
  };
  const handleSelectedNotification = async (chat) => {
    setSelectedChat(chat);
    if (notifications) {
      setNotifications(
        notifications.filter((notif) => notif.chat._id !== chat._id)
      );
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
  };
  return (
    <Box
      bg="white"
      width="100%"
      height="4rem"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p="1rem"
    >
      <SideDrawer />
      <Text fontSize="2xl">
        <strong>Chat app</strong>
      </Text>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Menu>
          <MenuButton>
            <NotificationBadge
              count={notifications.length}
              effect={Effect.SCALE}
            />
            <BellIcon boxSize={8} mr={2} />
          </MenuButton>
          <MenuList>
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                return (
                  <MenuItem
                    key={notif._id}
                    onClick={() => handleSelectedNotification(notif.chat)}
                  >
                    {notif.chat.isGroupChat
                      ? `New message from ${notif.sender.name} in group ${notif.chat.chatName}`
                      : `New message from ${notif.sender.name}`}
                  </MenuItem>
                );
              })
            ) : (
              <MenuItem>No notifications to show</MenuItem>
            )}
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton
            variant="ghost"
            as={Button}
            rightIcon={<ChevronDownIcon />}
            ml={2}
          >
            <Avatar size="sm" src={user.pic} name={user.nmae} />
          </MenuButton>
          <MenuList>
            <ProfileModal User={user}>
              <MenuItem>My Profile</MenuItem>
            </ProfileModal>
            <MenuDivider />
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </MenuList>
        </Menu>
      </Box>
    </Box>
  );
};

export default Header;
