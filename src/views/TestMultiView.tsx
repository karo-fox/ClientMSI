import axios from "axios";
import { ChangeEvent, useEffect, useState } from "react";
import { Algorithm } from "../models/Algorithm";
import { Button, Container, Form, Stack } from "react-bootstrap";

export default function TestMultiView() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [chosenAlgorithms, setChosenAlgorithms] = useState<Algorithm[]>([]);
  const [fitnessFunctions, setFitnessFunctions] = useState<{ name: string }[]>(
    []
  );
  const [fitnessFunction, setFitnessFunction] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    axios
      .get<Algorithm[]>("https://localhost:7083/algorithms")
      .then((response) => setAlgorithms(response.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    axios
      .get<{ name: string }[]>("https://localhost:7083/testfunctions")
      .then((response) => setFitnessFunctions(response.data))
      .catch((err) => console.log(err));
  }, []);

  const handleAlgorithmCheckedChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value, checked } = event.target;

    setChosenAlgorithms((prev = []) => {
      if (checked) {
        const selectedAlgorithm = algorithms.find((alg) => alg.name === value);
        if (selectedAlgorithm) {
          return [...prev, selectedAlgorithm];
        }
        return prev;
      } else {
        return prev.filter((alg) => alg.name !== value);
      }
    });
  };

  return (
    <Container>
      <Stack gap={3}>
        <h1>Test wielu algorytmów</h1>
        <Form>
          <Form.Group>
            <Form.Label>Algorytmy</Form.Label>
            <Stack>
              {algorithms.map((alg) => (
                <Form.Check
                key={`alg-${algorithms.indexOf(alg)}`}
                type="checkbox"
                label={alg.name}
                value={alg.name}
                onChange={handleAlgorithmCheckedChange}
                />
              ))}
            </Stack>
          </Form.Group>
          <Form.Group>
            <Form.Label>Funckcja testowa</Form.Label>
            <Form.Select
              name="fitness-func"
              value={fitnessFunction}
              onChange={(e)=> setFitnessFunction(e.target.value)}
            >
              <option key="defualt-fitness-func" value={undefined} />
              {fitnessFunctions.map((ff) => (
                <option key={`ff-${fitnessFunctions.indexOf(ff)}`} value={ff.name}>
                  {ff.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Form>
        <Button>
          Wyślij
        </Button>
      </Stack>
    </Container>
  );
}
