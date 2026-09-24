import "reflect-metadata";
import "dotenv/config";
import cors from "cors";
import express from "express";

import { AppDataSource } from "./database/data-source";
import { errorMiddleware, notFoundMiddleware } from "./middlewares/errorMiddleware";
import { routes } from "./routes";


const app = express()

app.use(cors())

app.use(express.json())

app.use(routes)

app.use(notFoundMiddleware)

app.use(errorMiddleware)

const PORT = Number(process.env.PORT) || 3333;

AppDataSource.initialize()
  .then(() => {
    console.log("Conexao com o PostgreSQL estabelecida com sucesso.");

    app.listen(PORT, () => {
      console.log(`MedClinic API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Falha ao iniciar a aplicacao:", err);
    process.exit(1);
  });