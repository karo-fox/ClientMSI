export interface ParameterInfo {
  name: string;
  description: string;
  upperBoundary: number;
  lowerBoundary: number;
}

export interface Parameter {
  lowerBoundary: number;
  upperBoundary: number;
  step: number;
}

export interface Algorithm {
  name: string;
  paramsInfo: ParameterInfo[];
}

export interface Domain {
  lowerBoundary: number;
  upperBoundary: number;
}

export interface DomainInfo {
  dimension: number;
  domain: Domain[];
}
