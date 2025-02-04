import { ChangeEvent, useEffect, useState, useCallback } from "react";
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

  const [algorithmError, setAlgorithmError] = useState<string | null>(null);
  const [parameterErrors, setParameterErrors] = useState<
    { lower: string | null; upper: string | null; step: string | null }[]
  >([]);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const [domainErrors, setDomainErrors] = useState<
    { lower: string | null; upper: string | null }[]
  >([]);
  const [fitnessFunctionError, setFitnessFunctionError] = useState<
    string | null
  >(null);

  const [isFormValid, setIsFormValid] = useState<boolean>(false);

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
    setParameterErrors(
      new Array(algorithm.paramsInfo.length).fill({
        lower: null,
        upper: null,
        step: null,
      })
    );
    setShowParameters(true);
  }, [algorithm]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!algorithm) {
      setAlgorithmError("Wybierz algorytm.");
      isValid = false;
    } else {
      setAlgorithmError(null);
    }

    parameterErrors.forEach((error) => {
      if (error.lower || error.upper || error.step) {
        isValid = false;
      }
    });

    if (!dimension || dimension <= 0) {
      setDimensionError("Wymiar musi być większy od 0.");
      isValid = false;
    } else {
      setDimensionError(null);
    }

    domainErrors.forEach((error) => {
      if (error.lower || error.upper) {
        isValid = false;
      }
    });

    if (chosenFitnessFunctions.length === 0) {
      setFitnessFunctionError("Wybierz co najmniej jedną funkcję testową.");
      isValid = false;
    } else {
      setFitnessFunctionError(null);
    }

    if (
      chosenParameters.filter(
        (p) => p.lowerBoundary === 0 && p.upperBoundary === 0 && p.step === 0
      ).length > 0
    ) {
      isValid = false;
    }

    if (
      domainInfo.domain.filter(
        (d) => d.lowerBoundary === 0 && d.upperBoundary === 0
      ).length > 0
    ) {
      isValid = false;
    }

    return isValid;
  }, [
    algorithm,
    parameterErrors,
    dimension,
    domainErrors,
    chosenFitnessFunctions,
    chosenParameters,
    domainInfo,
  ]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [validateForm]);

  const handleParameterChange = (
    value: number,
    index: number,
    type: "lower" | "upper" | "step"
  ): void => {
    if (index > chosenParameters.length) return;
    const parameters = [...chosenParameters];
    const updatedParameter = { ...parameters[index] };

    if (type === "lower") {
      if (
        value < parameterInfos[index].lowerBoundary ||
        value > parameterInfos[index].upperBoundary
      ) {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            lower: "Niepoprawna wartość.",
          };
          return newErrors;
        });
      } else {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], lower: null };
          return newErrors;
        });
      }
      updatedParameter.lowerBoundary = value;
    } else if (type === "upper") {
      if (
        value < parameterInfos[index].lowerBoundary ||
        value > parameterInfos[index].upperBoundary
      ) {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            upper: "Niepoprawna wartość.",
          };
          return newErrors;
        });
      } else {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], upper: null };
          return newErrors;
        });
      }
      updatedParameter.upperBoundary = value;
    } else if (type === "step") {
      if (value <= 0 || value > chosenParameters[index].upperBoundary) {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            step: "Niepoprawna wartość.",
          };
          return newErrors;
        });
      } else {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], step: null };
          return newErrors;
        });
      }
      updatedParameter.step = value;
    }

    parameters[index] = updatedParameter;
    setChosenParameters(parameters);
  };

  const handleDimensionChange = (dimension: number): void => {
    if (dimension <= 0) {
      setDimensionError("Wymiar musi być większy od 0.");
    } else {
      setDimensionError(null);
    }
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
      if (value > domainArray.at(index)!.upperBoundary) {
        setDomainErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            lower: "Dolna granica nie może być większa od górnej granicy.",
          };
          return newErrors;
        });
      } else {
        setDomainErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], lower: null };
          return newErrors;
        });
      }
      domainArray.at(index)!.lowerBoundary = value;
    }
    if (type === "upper") {
      if (value < domainArray.at(index)!.lowerBoundary) {
        setDomainErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            upper: "Górna granica nie może być mniejsza od dolnej granicy.",
          };
          return newErrors;
        });
      } else {
        setDomainErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], upper: null };
          return newErrors;
        });
      }
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

    if (checked && chosenFitnessFunctions.length === 0) {
      setFitnessFunctionError(null);
    }
  };

  const handleSubmit = () => {
    if (!isFormValid) return;

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
              onChange={(e) => {
                setAlgorithm(
                  algorithms.find((alg) => alg.name === e.target.value)
                );
                setAlgorithmError(null);
              }}
              isInvalid={!!algorithmError}
            >
              <option key="default-alg" value={undefined} />
              {algorithms.map((alg) => (
                <option key={`alg-${algorithms.indexOf(alg)}`} value={alg.name}>
                  {alg.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {algorithmError}
            </Form.Control.Feedback>
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
                          isInvalid={!!parameterErrors[idx]?.lower}
                        />
                        <Form.Control.Feedback type="invalid">
                          {parameterErrors[idx]?.lower}
                        </Form.Control.Feedback>
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
                          isInvalid={!!parameterErrors[idx]?.upper}
                        />
                        <Form.Control.Feedback type="invalid">
                          {parameterErrors[idx]?.upper}
                        </Form.Control.Feedback>
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
                          isInvalid={!!parameterErrors[idx]?.step}
                        />
                        <Form.Control.Feedback type="invalid">
                          {parameterErrors[idx]?.step}
                        </Form.Control.Feedback>
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
                isInvalid={!!dimensionError}
              />
              <Form.Control.Feedback type="invalid">
                {dimensionError}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Wartości</Form.Label>
              {domainInfo.domain.map((d, idx) => (
                <Row key={`domain-${idx}`}>
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
                      isInvalid={!!domainErrors[idx]?.lower}
                    />
                    <Form.Control.Feedback type="invalid">
                      {domainErrors[idx]?.lower}
                    </Form.Control.Feedback>
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
                      isInvalid={!!domainErrors[idx]?.upper}
                    />
                    <Form.Control.Feedback type="invalid">
                      {domainErrors[idx]?.upper}
                    </Form.Control.Feedback>
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
                  isInvalid={!!fitnessFunctionError}
                />
              ))}
            </Stack>
            <Form.Control.Feedback type="invalid">
              {fitnessFunctionError}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          Wyślij
        </Button>
      </Stack>
    </Container>
  );
}
