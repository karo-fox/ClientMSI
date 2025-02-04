import { useEffect, useState } from "react";
import {
  deleteReport,
  getAllReports,
  getReportByName,
} from "../repositories/reportRepository";
import { Button, Col, Container, Row, Stack } from "react-bootstrap";

export default function ReportView() {
  const [reports, setReports] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const result = await getAllReports();
      setReports(result);
    }
    fetchData();
  }, []);

  const handleDownload = async (name: string): Promise<void> => {
    try {
      const reportBlob = await getReportByName(name);

      if (reportBlob) {
        const url = window.URL.createObjectURL(reportBlob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${name}.zip`); // Set the filename for the download
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download report: Blob is null.");
      }
    } catch (err) {
      console.error("Error downloading report:", err);
    }
  };

  const handleDelete = async (name: string): Promise<void> => {
    const isDeleted = await deleteReport(name);

    if (isDeleted) {
      setReports((prevReports) =>
        prevReports.filter((report) => report !== name)
      );
      console.log(`Report "${name}" deleted successfully.`);
    } else {
      console.error(`Failed to delete report "${name}".`);
    }
  };

  return (
    <Container>
      <Stack gap={3}>
        <h1>Wyniki</h1>
        {reports.map((report) => (
          <Row>
            <Col xs={9}>
              <p>{report}</p>
            </Col>
            <Col>
              <Button onClick={() => handleDownload(report)}>Pobierz</Button>
            </Col>
            <Col>
              <Button variant="danger" onClick={() => handleDelete(report)}>Usuń</Button>
            </Col>
          </Row>
        ))}
      </Stack>
    </Container>
  );
}
