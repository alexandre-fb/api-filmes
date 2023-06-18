import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies",async (req, res) => {
    //busca os filmes do model movies
    const movies = await prisma.movie.findMany();
    //retorna os dados como json
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`);
});
