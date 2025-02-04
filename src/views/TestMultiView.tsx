import { ChangeEvent, useEffect, useState } from "react";
import { Algorithm, DomainInfo } from "../models/Algorithm";
import {
  Button,
  Col,
  Container,
  Form,
  FormControl,
  Row,
  Stack,
} from "react-bootstrap";
import { getAlgorithms } from "../repositories/algorithmRepository";
import { getFitnessFunction } from "../repositories/fitnessFunctionRepository";
import {
  MultiAlgorithmTestRequest,
  sendMultiAlgorithmTest,
} from "../repositories/calculationRepository";

export default function TestMultiView() {
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [chosenAlgorithms, setChosenAlgorithms] = useState<Algorithm[]>([]);
  const [fitnessFunctions, setFitnessFunctions] = useState<{ name: string }[]>(
    []
  );
  const [fitnessFunction, setFitnessFunction] = useState<string | undefined>(
    undefined
  );
  const [dimension, setDimension] = useState<number | undefined>();
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({
    dimension: 0,
    domain: [],
  });
  const [parameters, setParameters] = useState<
    { population: number; iterations: number }[]
  >([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getAlgorithms();
      setAlgorithms(result);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const result = await getFitnessFunction();
      setFitnessFunctions(result);
    }
    fetchData();
  }, []);

  useEffect(() => {
    setParameters(
      new Array<{ population: number; iterations: number }>(
        chosenAlgorithms.length
      ).fill({ population: 0, iterations: 0 })
    );
  }, [chosenAlgorithms]);

  const handleDimensionChange = (dimension: number): void => {
    setDimension(dimension);
    let domainArray = domainInfo.domain;
    if (dimension < domainArray.length) {
      setDomainInfo({ dimension, domain: domainArray.slice(0, dimension) });
      return;
    }
    if (dimension > domainArray.length) {
      let newDomainArray = [...domainArray];
      for (let i = domainArray.length; i < dimension; i++) {
        newDomainArray.push({ lowerBoundary: 0, upperBoundary: 0 });
      }
      setDomainInfo({ dimension, domain: newDomainArray });
      return;
    }
    setDomainInfo({ dimension, domain: domainArray });
  };

  const handleDomainBoundChange = (
    value: number,
    index: number,
    type: "lower" | "upper"
  ): void => {
    if (dimension && index >= dimension) return;

    let domainArray = [...domainInfo.domain];
    if (type === "lower") {
      if (value > domainArray.at(index)!.upperBoundary) return;
      domainArray.at(index)!.lowerBoundary = value;
    }
    if (type === "upper") {
      if (value < domainArray.at(index)!.lowerBoundary) return;
      domainArray.at(index)!.upperBoundary = value;
    }
    setDomainInfo({ dimension: dimension || 0, domain: domainArray });
  };

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

  const handleParametersChange = (
    value: number,
    index: number,
    type: "population" | "iterations"
  ): void => {
    if (index > parameters.length) return;
    let params = [...parameters];
    const updatedParam = { ...params[index] };
    if (type === "population") {
      updatedParam.population = value;
    } else if (type === "iterations") {
      updatedParam.iterations = value;
    }
    params[index] = updatedParam;
    setParameters(params);
  };

  const handleSubmit = (): void => {
    if (!fitnessFunction) return;
    const lowerDomainBoundaries = domainInfo.domain.map((d) => d.lowerBoundary);
    const upperDomainBoundaries = domainInfo.domain.map((d) => d.upperBoundary);

    const data: MultiAlgorithmTestRequest = {
      testFunctionName: fitnessFunction!,
      domain: [lowerDomainBoundaries, upperDomainBoundaries],
      parameters: parameters.map((p) => [p.population, p.iterations]),
      algorithmNames: chosenAlgorithms.map((ca) => ca.name),
    };
    sendMultiAlgorithmTest(data);
    setFitnessFunction(undefined);
    setDomainInfo({ dimension: 0, domain: [] });
    setParameters([]);
    setChosenAlgorithms([]);
  };

  return (
    <Container>
      <Stack gap={3}>
        <h1>Test wielu algorytmów</h1>
        <Form>
          <Form.Group>
            <Form.Label>Funckcja testowa</Form.Label>
            <Form.Select
              name="fitness-func"
              value={fitnessFunction}
              onChange={(e) => setFitnessFunction(e.target.value)}
            >
              <option key="defualt-fitness-func" value={undefined} />
              {fitnessFunctions.map((ff) => (
                <option
                  key={`ff-${fitnessFunctions.indexOf(ff)}`}
                  value={ff.name}
                >
                  {ff.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Domena</Form.Label>
            <Form.Group>
              <Form.Label>Wymiar</Form.Label>
              <FormControl
                type="number"
                value={dimension}
                onChange={(e) => handleDimensionChange(Number(e.target.value))}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Wartości</Form.Label>
              {domainInfo.domain.map((d, idx) => (
                <Row>
                  <Form.Group as={Col}>
                    <Form.Label>Dolna granica</Form.Label>
                    <FormControl
                      type="number"
                      onChange={(e) =>
                        handleDomainBoundChange(
                          Number(e.target.value),
                          idx,
                          "lower"
                        )
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>Górna granica</Form.Label>
                    <FormControl
                      type="number"
                      onChange={(e) =>
                        handleDomainBoundChange(
                          Number(e.target.value),
                          idx,
                          "upper"
                        )
                      }
                    />
                  </Form.Group>
                </Row>
              ))}
            </Form.Group>
          </Form.Group>
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
            <Form.Label>Parametry</Form.Label>
            {chosenAlgorithms.map((ca, idx) => (
              <Row>
                <Form.Label>{ca.name}</Form.Label>
                <Form.Group as={Col}>
                  <Form.Label>Populacja</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) =>
                      handleParametersChange(
                        Number(e.target.value),
                        idx,
                        "population"
                      )
                    }
                  />
                </Form.Group>
                <Form.Group as={Col}>
                  <Form.Label>Iteracje</Form.Label>
                  <Form.Control
                    type="number"
                    onChange={(e) =>
                      handleParametersChange(
                        Number(e.target.value),
                        idx,
                        "iterations"
                      )
                    }
                  />
                </Form.Group>
              </Row>
            ))}
          </Form.Group>
        </Form>
        <Button onClick={handleSubmit}>Wyślij</Button>
      </Stack>
    </Container>
  );
}
