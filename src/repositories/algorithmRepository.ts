import axios from "axios";
import { Algorithm } from "../models/Algorithm";

const HOSTNAME = "localhost:7083";

export const getAlgorithms = async (): Promise<Algorithm[]> => {
  const result = await axios
    .get<Algorithm[]>(`https://${HOSTNAME}/algorithms`)
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return result || [];
};
