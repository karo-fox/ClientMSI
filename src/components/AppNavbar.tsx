import { Container, Nav, Navbar } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export default function AppNavbar() {
  return (
    <Navbar fixed="top">
      <Container>
        <LinkContainer to="/home">
          <Navbar.Brand>Porównywarka algorytmów</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav>
            <LinkContainer to="/test-single">
              <Nav.Link>Pojedynczy algorytm</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <LinkContainer to="/test-multi">
              <Nav.Link>Wiele algorytmów</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav>
            <LinkContainer to={"/reports"}>
              <Nav.Link>Wyniki</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
