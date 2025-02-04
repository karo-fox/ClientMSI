import { ChangeEvent, useCallback, useEffect, useState } from "react";
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

  const [fitnessFunctionError, setFitnessFunctionError] = useState<
    string | null
  >(null);
  const [dimensionError, setDimensionError] = useState<string | null>(null);
  const [domainErrors, setDomainErrors] = useState<
    { lower: string | null; upper: string | null }[]
  >([]);
  const [algorithmError, setAlgorithmError] = useState<string | null>(null);
  const [parameterErrors, setParameterErrors] = useState<
    { population: string | null; iterations: string | null }[]
  >([]);

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
    setParameters(
      new Array<{ population: number; iterations: number }>(
        chosenAlgorithms.length
      ).fill({ population: 0, iterations: 0 })
    );
    setParameterErrors(
      new Array(chosenAlgorithms.length).fill({
        population: null,
        iterations: null,
      })
    );
  }, [chosenAlgorithms]);

  const validateForm = useCallback((): boolean => {
    let isValid = true;

    if (!fitnessFunction) {
      setFitnessFunctionError("Wybierz funkcję testową.");
      isValid = false;
    } else {
      setFitnessFunctionError(null);
    }

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

    if (chosenAlgorithms.length === 0) {
      setAlgorithmError("Wybierz co najmniej jeden algorytm.");
      isValid = false;
    } else {
      setAlgorithmError(null);
    }

    parameterErrors.forEach((error) => {
      if (error.population || error.iterations) {
        isValid = false;
      }
    });

    if (parameters.filter((p) => p.iterations === 0 && p.population === 0).length > 0) {
      isValid = false;
    };

    if (domainInfo.domain.filter((p) => p.lowerBoundary === 0 && p.upperBoundary === 0).length > 0) {
      isValid = false;
    };

    return isValid;
  }, [
    chosenAlgorithms.length,
    dimension,
    domainErrors,
    parameterErrors,
    fitnessFunction,
    parameters,
    domainInfo.domain,
  ]);

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [
    fitnessFunction,
    dimension,
    domainInfo,
    chosenAlgorithms,
    parameters,
    domainErrors,
    parameterErrors,
    validateForm,
  ]);

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

    if (checked && chosenAlgorithms.length === 0) {
      setAlgorithmError(null);
    }
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
      if (value <= 0) {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            population: "Populacja musi być większa od 0.",
          };
          return newErrors;
        });
      } else {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], population: null };
          return newErrors;
        });
      }
      updatedParam.population = value;
    } else if (type === "iterations") {
      if (value <= 0) {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = {
            ...newErrors[index],
            iterations: "Iteracje muszą być większe od 0.",
          };
          return newErrors;
        });
      } else {
        setParameterErrors((prev) => {
          const newErrors = [...prev];
          newErrors[index] = { ...newErrors[index], iterations: null };
          return newErrors;
        });
      }
      updatedParam.iterations = value;
    }

    params[index] = updatedParam;
    setParameters(params);
  };

  const handleSubmit = (): void => {
    if (!isFormValid) return;

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
              onChange={(e) => {
                setFitnessFunction(e.target.value);
                setFitnessFunctionError(null);
              }}
              isInvalid={!!fitnessFunctionError}
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
            <Form.Control.Feedback type="invalid">
              {fitnessFunctionError}
            </Form.Control.Feedback>
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
            <Form.Label>Algorytmy</Form.Label>
            <Stack>
              {algorithms.map((alg) => (
                <Form.Check
                  key={`alg-${algorithms.indexOf(alg)}`}
                  type="checkbox"
                  label={alg.name}
                  value={alg.name}
                  onChange={handleAlgorithmCheckedChange}
                  isInvalid={!!algorithmError}
                />
              ))}
            </Stack>
            <Form.Control.Feedback type="invalid">
              {algorithmError}
            </Form.Control.Feedback>
          </Form.Group>
          <Form.Group>
            <Form.Label>Parametry</Form.Label>
            {chosenAlgorithms.map((ca, idx) => (
              <Row key={`param-${idx}`}>
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
                    isInvalid={!!parameterErrors[idx]?.population}
                  />
                  <Form.Control.Feedback type="invalid">
                    {parameterErrors[idx]?.population}
                  </Form.Control.Feedback>
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
                    isInvalid={!!parameterErrors[idx]?.iterations}
                  />
                  <Form.Control.Feedback type="invalid">
                    {parameterErrors[idx]?.iterations}
                  </Form.Control.Feedback>
                </Form.Group>
              </Row>
            ))}
          </Form.Group>
        </Form>
        <Button onClick={handleSubmit} disabled={!isFormValid}>
          Wyślij
        </Button>
      </Stack>
    </Container>
  );
}
