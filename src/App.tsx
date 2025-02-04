import "./App.css";
import { Container, Stack } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import TestController from "./components/TestController";

function App() {
  return (
    <>
      <AppNavbar />
      <Container style={{ paddingBottom: "4rem", paddingTop: "4rem" }}>
        <Stack gap={3}>
          <TestController />
          <Outlet />
        </Stack>
      </Container>
    </>
  );
}

export default App;
