import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

//Pra conseguir ler json
app.use(express.json());

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

app.post("/movies", async (req, res) => {
    const { title, release_date, genre_id, language_id, oscar_count } = req.body;

    try {

        //verificar no banco se já existe um filme com o nome que está sendo enviado
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive"
                }
            }
        });

        if(movieWithSameTitle) {
            return res.status(409).send(
                {
                    message: "Já existe um filme cadastrado com esse título"
                }
            );
        }

        const movie = await prisma.movie.create({
            data: {
                title: title,
                release_date: new Date(release_date),
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count
            }
        });
    } catch(error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme" });
    }

    res.status(201).send();
});

app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`);
});
 