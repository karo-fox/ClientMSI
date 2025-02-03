import "./App.css";
import { Container } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";

function App() {
  return (
    <>
    <AppNavbar />
      <Container style={{ paddingBottom: "4rem", paddingTop: "4rem" }}>
        <Outlet />
      </Container>
    </>
  );
}

export default App;
