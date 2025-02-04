import { useEffect, useState } from "react";
import { Button, Col, Container, Row } from "react-bootstrap";
import { sendCommand } from "../repositories/calculationRepository";

export default function TestController() {
  const [testState, setTestState] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const result = await sendCommand("result");
      setTestState(result);
    }
    fetchData();
  }, []);

  const handleStop = async () => {
    const result = await sendCommand("stop");
    setTestState(result);
  };

  const handleResume = async () => {
    const result = await sendCommand("resume");
    setTestState(result);
  };

  const handleReload = async () => {
    const result = await sendCommand("result");
    setTestState(result);
  };

  return (
    <Container>
      <Row>
        <Col>
          <p>stan obliczeń: {testState}</p>
        </Col>
        <Col>
          <Row>
            <Col>
              <Button onClick={handleStop}>Stop</Button>
            </Col>
            <Col>
              <Button onClick={handleResume}>Wznów</Button>
            </Col>
            <Col>
              <Button onClick={handleReload}>Odśwież</Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
