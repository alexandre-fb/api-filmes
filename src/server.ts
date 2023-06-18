import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies",async (req, res) => {
    //busca os filmes do model movies
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc"
        },
        include: {
            genres: true, //Adiciona todos os dados da tabela genres
            languages: true //Adiciona todos os dados da tabela languages
        }
    });
    //retorna os dados como json
    res.json(movies);
});

app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`);
});
 