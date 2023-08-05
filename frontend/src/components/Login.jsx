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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const handleClick = async () => {
    if (!email || !password) {
      toast({
        title: "Warning",
        description: "Please fill all fields",
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
        "/api/users/login",
        { email, password },
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
  const handleGuest = () => {
    setEmail("guest@example.com");
    setPassword("123456");
  };
  return (
    <Stack spacing={3}>
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
        onKeyDown={(e) => (e.key === "Enter" ? handleClick() : null)}
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
          onKeyDown={(e) => (e.key === "Enter" ? handleClick() : null)}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
      <Button
        isLoading={loading}
        colorScheme="blue"
        width="95%"
        mt=".5rem"
        onClick={handleClick}
      >
        Login
      </Button>
      <Button colorScheme="red" width="95%" onClick={handleGuest}>
        Guest Credentials
      </Button>
    </Stack>
  );
};

export default Login;
