import {
  Box,
  Center,
  Container,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Login from "../components/Login";
import Signup from "../components/Signup";

const Homepage = () => {
  return (
    <>
      <Container maxW="2xl" centerContent>
        <Box
          bg="white"
          w="100%"
          mt="6rem"
          borderRadius="md"
          p={4}
          color="black"
        >
          <Center fontSize="2xl">Welcome to Chit-chat App</Center>
        </Box>
        <Box
          bg="white"
          w="100%"
          mt="1rem"
          borderRadius="md"
          p={4}
          color="black"
        >
          <Tabs isFitted variant="soft-rounded" colorScheme="blue">
            <TabList>
              <Tab>Login</Tab>
              <Tab>Signup</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Login />
              </TabPanel>
              <TabPanel>
                <Signup />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Container>
    </>
  );
};

export default Homepage;
