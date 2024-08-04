const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

morgan.token("data", (req) => {
  return req.method === "POST" ? JSON.stringify(req.body) : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :data")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (req, res) => {
  const requestTime = new Date().toISOString();
  const numberOfPersons = persons.length;

  res.send(
    `<p>Phonebook has info for ${numberOfPersons} people <br> ${requestTime}</br></p>`
  );
});

app.get("/api/persons/:id", (req, resp) => {
  const id = req.params.id;

  const filterPerson = persons.find((person) => person.id === id);
  // persons.filter((person) => person.id === id);

  if (filterPerson) {
    resp.json(filterPerson);
    resp.status(200);
  } else {
    resp.status(404).send(`<h1>404 Not Found!</h1>`).end();
  }
});

app.delete("/api/persons/:id", (req, resp) => {
  const id = req.params.id;
  const personExist = persons.find((person) => person.id === id);

  if (personExist) {
    persons = persons.filter((person) => person.id !== id);
    resp.status(204).end();
  } else {
    resp.status(404).send("<h1>404 Not Found!</h1>").end();
  }
});

app.post("/api/persons", (req, resp) => {
  const newPerson = req.body;
  const personExist = persons.find((person) => person.name === newPerson.name);

  if (personExist) {
    return resp.status(401).json({ error: "name must be unique" });
  }

  if (!newPerson.name) {
    return resp.status(401).json({ error: "name is requiered" });
  }
  if (!newPerson.number) {
    return resp.status(401).json({ error: "number is requiered" });
  }

  if (!personExist && newPerson.name && newPerson.number) {
    newPerson.id = Math.floor(Math.random() * 1000).toString();
    persons = persons.concat(newPerson);
    resp.status(201).end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
