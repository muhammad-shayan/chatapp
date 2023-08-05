import { Avatar, Box, Text } from "@chakra-ui/react";

const UserList = ({ user, handleClick }) => {
  return (
    <Box
      width="100%"
      bg="#E8E8E8"
      _hover={{ bg: "#38B2AC", color: "white" }}
      borderWidth="1px"
      borderRadius="lg"
      display="flex"
      mt="0.25rem"
      overflow="hidden"
      cursor="pointer"
      onClick={() => handleClick(user)}
    >
      <Avatar src={user.pic} m="0.6rem" />
      <Box display="flex" flexDirection="column">
        <Text mt="0.5rem">{user.name}</Text>
        <Text fontSize="sm">
          <strong>Email:</strong> {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserList;
