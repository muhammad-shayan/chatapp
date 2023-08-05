import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  IconButton,
  Image,
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
import axios from "axios";
import { useState } from "react";
import { ChatState } from "../context/ChatContext";

const ProfileModal = ({ children, User, handleDelete }) => {
  const { setUser } = ChatState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState(User.name);
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const toast = useToast();

  const uploadPic = (profilePic) => {
    if (!profilePic) {
      toast({
        title: "Please select a picture",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    if (profilePic.type === "image/jpeg" || profilePic.type === "image/png") {
      setLoading(true);
      const data = new FormData();
      data.append("file", profilePic);
      data.append("upload_preset", "chat-app");
      data.append("cloud_name", "shayanbukhari");
      fetch("https://api.cloudinary.com/v1_1/shayanbukhari/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } else {
      toast({
        title: "Please select a jpeg/png picture",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
  };

  const handleClick = async () => {
    if (!name && !pic) {
      toast({
        title: "Warning",
        description: "Please fill at least one update field",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${User.token}`,
        },
      };
      const { data } = await axios.put(
        `/api/users/${User._id}`,
        { name, pic },
        config
      );
      setUser(data);
      setShowEdit(false);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  return (
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          size="lg"
          onClick={onOpen}
          icon={<ViewIcon fontSize="1.5rem" />}
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            display="flex"
            justifyContent="center"
            alignItems="center"
            fontSize="4xl"
          >
            {User.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              display="flex"
              flexDir="column"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={User.pic}
                borderRadius="full"
                boxSize="12rem"
                my="1rem"
              />
              <Text fontSize="4xl">{User.email}</Text>
              {showEdit && (
                <>
                  <Text fontSize="md" alignSelf="flex-start" my={2}>
                    <b>Enter new Name:</b>
                  </Text>
                  <Input
                    type="text"
                    value={name}
                    placeholder="Enter new Name"
                    size="md"
                    width="95%"
                    mx="auto"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Text fontSize="md" alignSelf="flex-start" my={2}>
                    <b>Upload new Picture:</b>
                  </Text>
                  <Input
                    type="file"
                    accept="image/*"
                    p={1}
                    size="md"
                    width="95%"
                    mx="auto"
                    onChange={(e) => uploadPic(e.target.files[0])}
                  />
                  <Button
                    isLoading={loading}
                    colorScheme="green"
                    alignSelf="flex-end"
                    mr={3}
                    mt={2}
                    onClick={handleClick}
                  >
                    Update
                  </Button>
                </>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
            {children ? (
              <Button
                colorScheme="purple"
                mr={3}
                onClick={() => setShowEdit(!showEdit)}
              >
                Edit Profile
              </Button>
            ) : (
              <Button colorScheme="red" mr={3} onClick={handleDelete}>
                Delete Chat
              </Button>
            )}

            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
