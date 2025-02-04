import { ChangeEvent, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Col,
  Container,
  Form,
  FormControl,
  Row,
  Stack,
  Table,
} from "react-bootstrap";
import {
  ParameterInfo,
  Algorithm,
  DomainInfo,
  Parameter,
} from "../models/Algorithm";
import { getAlgorithms } from "../repositories/algorithmRepository";
import { getFitnessFunction } from "../repositories/fitnessFunctionRepository";
import {
  sendSingleAlgorithmTest,
  SingleAlgorithmTestRequest,
} from "../repositories/calculationRepository";

export default function TestSingleView() {
  const [showParameters, setShowParameters] = useState(false);
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([]);
  const [algorithm, setAlgorithm] = useState<Algorithm | undefined>(undefined);
  const [parameterInfos, setParameterInfos] = useState<ParameterInfo[]>([]);
  const [chosenParameters, setChosenParameters] = useState<Parameter[]>([]);
  const [dimension, setDimension] = useState<number | undefined>();
  const [domainInfo, setDomainInfo] = useState<DomainInfo>({
    dimension: 0,
    domain: [],
  });
  const [fitnessFunctions, setFitnessFunctions] = useState<{ name: string }[]>(
    []
  );
  const [chosenFitnessFunctions, setChosenFitnessFunctions] = useState<
    string[]
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
    if (!algorithm) {
      setShowParameters(false);
      setParameterInfos([]);
      return;
    }
    setParameterInfos(algorithm.paramsInfo);
    setChosenParameters(
      new Array<Parameter>(algorithm.paramsInfo.length).fill({
        lowerBoundary: 0,
        upperBoundary: 0,
        step: 0,
      })
    );
    setShowParameters(true);
  }, [algorithm]);

  const handleParameterChange = (
    value: number,
    index: number,
    type: "lower" | "upper" | "step"
  ): void => {
    if (index > chosenParameters.length) return;
    const parameters = [...chosenParameters];
    const updatedParameter = { ...parameters[index] };
    if (type === "lower") {
      updatedParameter.lowerBoundary = value;
    } else if (type === "upper") {
      updatedParameter.upperBoundary = value;
    } else if (type === "step") {
      updatedParameter.step = value;
    }
    parameters[index] = updatedParameter;
    setChosenParameters(parameters);
  };

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

  const handleFunctionCheckedChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    const { value, checked } = event.target;

    setChosenFitnessFunctions((prev = []) =>
      checked ? [...prev, value] : prev.filter((ff) => ff !== value)
    );
  };

  const handleSubmit = () => {
    if (!algorithm) return;
    const lowerDomainBoundaries = domainInfo.domain.map((d) => d.lowerBoundary);
    const upperDomainBoundaries = domainInfo.domain.map((d) => d.upperBoundary);

    const data: SingleAlgorithmTestRequest = {
      algorithmName: algorithm.name,
      domain: [lowerDomainBoundaries, upperDomainBoundaries],
      parameters: chosenParameters.map((cp) => [
        cp.lowerBoundary,
        cp.upperBoundary,
        cp.step,
      ]),
      testFunctionNames: chosenFitnessFunctions,
    };
    sendSingleAlgorithmTest(data);
  };

  return (
    <Container>
      <Stack gap={3}>
        <h1>Test pojedynczego algorytmu</h1>
        <Form>
          <Form.Group>
            <Form.Label>Algorytm</Form.Label>
            <Form.Select
              name="algorithm"
              value={algorithm?.name}
              onChange={(e) =>
                setAlgorithm(
                  algorithms.find((alg) => alg.name === e.target.value)
                )
              }
            >
              <option key="defualt-alg" value={undefined} />
              {algorithms.map((alg) => (
                <option key={`alg-${algorithms.indexOf(alg)}`} value={alg.name}>
                  {alg.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label>Parametry</Form.Label>
            {showParameters ? (
              <Table>
                <thead>
                  <tr>
                    <th>nazwa</th>
                    <th>opis</th>
                    <th>dolna granica</th>
                    <th>górna granica</th>
                    <th>ustaw dolną granicę</th>
                    <th>ustaw górną granicę</th>
                    <th>ustaw krok</th>
                  </tr>
                </thead>
                <tbody>
                  {parameterInfos.map((pi, idx) => (
                    <tr key={`param-${parameterInfos.indexOf(pi)}`}>
                      <td>{pi.name}</td>
                      <td>{pi.description}</td>
                      <td>{pi.lowerBoundary}</td>
                      <td>{pi.upperBoundary}</td>
                      <td>
                        <FormControl
                          type="number"
                          onChange={(e) =>
                            handleParameterChange(
                              Number(e.target.value),
                              idx,
                              "lower"
                            )
                          }
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          onChange={(e) =>
                            handleParameterChange(
                              Number(e.target.value),
                              idx,
                              "upper"
                            )
                          }
                        />
                      </td>
                      <td>
                        <FormControl
                          type="number"
                          onChange={(e) =>
                            handleParameterChange(
                              Number(e.target.value),
                              idx,
                              "step"
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert>Najpierw wybierz algorytm!</Alert>
            )}
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
            <Form.Label>Funkcje testowe</Form.Label>
            <Stack>
              {fitnessFunctions.map((ff) => (
                <Form.Check
                  key={`ff-${fitnessFunctions.indexOf(ff)}`}
                  type="checkbox"
                  label={ff.name}
                  value={ff.name}
                  onChange={handleFunctionCheckedChange}
                />
              ))}
            </Stack>
          </Form.Group>
        </Form>
        <Button onClick={handleSubmit}>Wyślij</Button>
      </Stack>
    </Container>
  );
}
