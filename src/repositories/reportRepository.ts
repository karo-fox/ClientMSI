import axios from "axios";

const HOSTNAME = "localhost:7083";

export const getAllReports = async (): Promise<string[]> => {
  const result = await axios
    .get<string[]>(`https://${HOSTNAME}/report`)
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return result || [];
};

export const getReportByName = async (name: string): Promise<Blob | null> => {
  const result = await axios
    .get(`https://${HOSTNAME}/report/${name}`, {
      responseType: "blob",
    })
    .then((response) => new Blob([response.data], { type: "application/zip" }))
    .catch((err) => console.log(err));
  return result || null;
};

export const deleteReport = async (name: string): Promise<boolean> => {
  const result = await axios
    .delete(`https://${HOSTNAME}/report/${name}`)
    .then((response) => true)
    .catch((err) => console.log(err));
  return result || false;
};
