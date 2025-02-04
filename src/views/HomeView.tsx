import { Button, Container, Stack } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";

export default function HomeView() {
  return (
    <Container>
      <Stack gap={3}>
        <LinkContainer to={"/test-single"}>
          <Button>testuj pojedynczy algorytm</Button>
        </LinkContainer>
        <LinkContainer to={"/test-multi"}>
          <Button>testuj wiele algorytmów</Button>
        </LinkContainer>
        <LinkContainer to={"/reports"}>
          <Button>zobacz wyniki</Button>
        </LinkContainer>
      </Stack>
    </Container>
  );
}
