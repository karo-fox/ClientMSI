import { Button, Container, Stack } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export default function HomeView() {
  return (
    <Container>
      <Stack gap={3}>
        <h1>Strona główna</h1>
        <LinkContainer to={"/test-single"}>
          <Button>testuj pojedynczy algorytm</Button>
        </LinkContainer>
        <LinkContainer to={"/test-multi"}>
          <Button>testuj wiele algorytmów</Button>
        </LinkContainer>
        <LinkContainer to={"/reports"}>
          <Button>zobacz wyniki</Button>
        </LinkContainer>
        <LinkContainer to={"/dlls"}>
          <Button>dodaj DLL</Button>
        </LinkContainer>
      </Stack>
    </Container>
  );
}
