import axios from "axios";

const HOSTNAME = "localhost:7083";

export const getFitnessFunction = async (): Promise<{ name: string }[]> => {
  const result = await axios
    .get<{ name: string }[]>(`https://${HOSTNAME}/testfunctions`)
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return result || [];
};
