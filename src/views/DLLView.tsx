import { useEffect, useState } from "react";
import { Button, Container, Form, Stack } from "react-bootstrap";
import DLLAlgorithm from "../models/DLLs";
import { deleteDLL, getDLLs, uploadDll } from "../repositories/DLLRepository";

export default function DLLView() {
  const [dlls, setDlls] = useState<DLLAlgorithm[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      const result = await getDLLs();
      setDlls(result);
    }
    fetchData();
  }, []);

  const handleDelete = async (filename: string): Promise<void> => {
    const isDeleted = await deleteDLL(filename);

    if (isDeleted) {
      setDlls((prevDlls) =>
        prevDlls.filter((dll) => dll.fileName !== filename)
      );
      console.log(`DLL "${filename}" deleted successfully.`);
    } else {
      console.error(`Failed to delete DLL "${filename}".`);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected.");
      return;
    }

    try {
      const result = await uploadDll(selectedFile);

      if (result) {
        const updatedDLLs = await getDLLs();
        setDlls(updatedDLLs);
        console.log("File uploaded successfully.");
      } else {
        console.error("Failed to upload file.");
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    }
  };

  return (
    <Container>
      <Stack gap={3}>
        <h1>Dll</h1>
        <Form>
          <Form.Group>
            <Form.Label>Plik .dll</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>
        </Form>
        <Button onClick={handleUpload}>Prześlij</Button>
        <h2>Załadowane DLL</h2>
        {dlls.map((dll) => (
          <Container>
            <h3>
              {dll.fileName}{" "}
              <Button
                variant="danger"
                onClick={() => handleDelete(dll.fileName)}
              >
                Usuń plik
              </Button>
            </h3>
            <h4>Algorytmy</h4>
            {dll.algorithmList.map((a) => (
              <p>{a.name}</p>
            ))}
            <h4>Funkcje</h4>
            {dll.functionList.map((f) => (
              <p>{f.name}</p>
            ))}
          </Container>
        ))}
      </Stack>
    </Container>
  );
}
