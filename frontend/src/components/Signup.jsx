import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confPassShow, setConfPassShow] = useState(false);
  const [pic, setPic] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

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
    if (!name || !email || !password) {
      toast({
        title: "Warning",
        description: "Please fill all fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Warning",
        description: "Passwords not matched",
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
        },
      };
      const { data } = await axios.post(
        "/api/users/",
        { name, email, password, pic },
        config
      );
      toast({
        title: "Login completed",
        description: "User login successful",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      localStorage.setItem("user", JSON.stringify(data));
      setLoading(false);
      navigate("/chats");
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
    <Stack spacing={3}>
      <Text fontSize="md">
        <b>
          Name<span style={{ color: "red" }}>*</span>
        </b>
      </Text>
      <Input
        type="text"
        value={name}
        placeholder="Enter your Name"
        size="md"
        width="95%"
        mx="auto"
        onChange={(e) => setName(e.target.value)}
      />
      <Text fontSize="md">
        <b>
          Email Address<span style={{ color: "red" }}>*</span>
        </b>
      </Text>
      <Input
        type="text"
        value={email}
        placeholder="Enter your Email Address"
        size="md"
        width="95%"
        mx="auto"
        onChange={(e) => setEmail(e.target.value)}
      />
      <Text fontSize="md">
        <b>
          Password<span style={{ color: "red" }}>*</span>
        </b>
      </Text>
      <InputGroup size="md" width="95%" mx="auto">
        <Input
          type={show ? "text" : "password"}
          value={password}
          placeholder="Enter password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>

      <InputGroup size="md" width="95%" mx="auto">
        <Input
          type={confPassShow ? "text" : "password"}
          value={confirmPassword}
          placeholder="Confirm your password"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            size="sm"
            onClick={() => setConfPassShow(!confPassShow)}
          >
            {confPassShow ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>

      <Text fontSize="md">
        <b>Upload your Picture</b>
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
        colorScheme="blue"
        width="95%"
        mt=".5rem"
        onClick={handleClick}
      >
        Signup
      </Button>
    </Stack>
  );
};

export default Login;
