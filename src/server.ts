import "dotenv/config";
import express from "express";

const app = express();

app.use(express.json());


app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3333;

app.listen(PORT, () => {
  console.log(`MedClinic API rodando em http://localhost:${PORT}`);
});