import axios from "axios";

const HOSTNAME = "localhost:7083";

export interface SingleAlgorithmTestRequest {
  algorithmName: string;
  domain: number[][];
  parameters: number[][];
  testFunctionNames: string[];
}

export const sendSingleAlgorithmTest = (
  data: SingleAlgorithmTestRequest
): void => {
  axios
    .post<SingleAlgorithmTestRequest>(
      `https://${HOSTNAME}/calculationprocessor/onealgorithmmanyfunctions`,
      data
    )
    .then((response) => console.log(response.data))
    .catch((err) => console.log(err));
};

export interface MultiAlgorithmTestRequest {
  testFunctionName: string;
  domain: number[][];
  parameters: number[][];
  algorithmNames: string[];
}

export const sendMultiAlgorithmTest = (
  data: MultiAlgorithmTestRequest
): void => {
  axios
    .post<MultiAlgorithmTestRequest>(
      `https://${HOSTNAME}/calculationprocessor/onefunctionmanyalgorithms`,
      data
    )
    .then((response) => console.log(response.data))
    .catch((err) => console.log(err));
};

export const sendCommand = async (
  command: "result" | "stop" | "resume"
): Promise<string> => {
  const result = await axios
    .get<string>(`https://${HOSTNAME}/calculationprocessor/${command}`)
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return result || "";
};
