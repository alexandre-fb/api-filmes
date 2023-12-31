import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../swagger.json";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

//Pra conseguir ler json
app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

app.put("/movies/:id", async (req, res) => {
    //pegar o id do registro que vai ser atualizado
    const id = Number(req.params.id); 

    try {
        //Valida se existe o filme registrado e retorna mensagem caso nao tenha
        const movie = await prisma.movie.findUnique({
            where: {
                id: id
            }
        });

        if(!movie) {
            return res.status(404).send({
                message: "Filme não encontrado"
            });
        }

        const data = { ...req.body };
        //Valida o release_data pq tem que ser no formato data
        data.release_date = data.release_date ? new Date(data.release_date) : undefined;

        //pegar os dados que quero atualizar e atualizar ele no prisma
        await prisma.movie.update({
            where: {
                id: id
            },
            data: data
        });

    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro do filme." });
    }

    //retornar o status correto informando que o filme foi atualizado
    res.status(200).send({ message: "Atualizado com sucesso" });
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {

        const movie = await prisma.movie.findUnique({
            where: { id: id }
        });

        if(!movie) {
            return res.status(404).send({ message: "Filme não encontrado." });
        }

        await prisma.movie.delete({
            where: { id: id }
        });

    } catch (error) {
        return res.status(500).send({ message: "Não foi possível remover o filme." });
    }

    res.status(200).send("Filme removido com sucesso");
});

app.get("/movies/:genreName", async (req, res) => {
    //receber o nome do gênero pelo parâmetro da rota
    const genre = req.params.genreName;

    try {
        //filtrar os filmes do banco pelo gênero
        const moviesFilteredByGenreName = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: genre,
                        mode: "insensitive"
                    },
                }
            }
        });

        //retornar os filmes filtrados na resposta da rota
        res.status(200).send(moviesFilteredByGenreName);

    } catch (error) {
        return res.status(500).send({ message: "Ocorreu um erro ao filtrar" });
    }
});

app.listen(port, () => {
    console.log(`Servidor em execucao na porta ${port}`);
});
 