import { ParameterInfo } from "./Algorithm";

export default interface DLLAlgorithm {
  name: string;
  paramsInfo: ParameterInfo[];
  writer: any;
  reader: any;
  stringReportGenerator: any;
  pdfReportGenarator: any;
  xBest: number[];
  fBest: number;
  numberOfEvaluationFitnessFunction: number;
  currentIteration: number;
  population: number[][];
  populationValues: number[];
  stop: boolean;
  parametersUsedValues: any;
}

export default interface DLLContent {
  fileName: string;
  algorithmList: DLLAlgorithm[];
  functionList: { name: string }[];
}
