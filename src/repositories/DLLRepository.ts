import axios from "axios";
import DLLAlgorithm from "../models/DLLs";

const HOSTNAME = "localhost:7083";

export const getDLLs = async (): Promise<DLLAlgorithm[]> => {
  const result = await axios
    .get<DLLAlgorithm[]>(`https://${HOSTNAME}/dllcontroler`)
    .then((response) => response.data)
    .catch((err) => console.log(err));
  return result || [];
};

export const deleteDLL = async (filename: string): Promise<boolean> => {
  const result = await axios
    .delete(`https://${HOSTNAME}/dllcontroler/${filename}`)
    .then((response) => true)
    .catch((err) => console.log(err));
  return result || false;
};

export const uploadDll = async (file: File): Promise<boolean> => {
  const formData = new FormData();
  formData.append("file", file);
  const result = await axios
    .post(`https://${HOSTNAME}/dllcontroler`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.status === 200)
    .catch((err) => console.log(err));
  return result || false;
};
