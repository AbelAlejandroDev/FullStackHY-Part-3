require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.json())

morgan.token('data', (req) => {
  return req.method === 'POST' ? JSON.stringify(req.body) : ''
})

app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
)

app.use(express.static('dist'))

// let persons = [
//   {
//     id: "1",
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: "2",
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: "3",
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: "4",
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((result) => response.json(result))
    .catch((error) => next(error))
})

app.get('/info', (req, res) => {
  const requestTime = new Date().toISOString()
  const numberOfPersons = Person.length

  res.send(
    `<p>Phonebook has info for ${numberOfPersons} people <br> ${requestTime}</br></p>`
  )
})

app.get('/api/persons/:id', (req, resp, next) => {
  const id = req.params.id

  Person.findById(id)
    .then((person) => {
      if (person) {
        resp.status(200).json(person)
      } else {
        resp
          .status(404)
          .send('<h1>404 Not Found!, person not found :( </h1>')
          .end()
      }
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (req, resp, next) => {
  const newPerson = req.body

  if (!newPerson.name) {
    return resp.status(401).json({ error: 'name is requiered' })
  }
  if (!newPerson.number) {
    return resp.status(401).json({ error: 'number is requiered' })
  }

  const person = new Person({
    name: newPerson.name,
    number: newPerson.number,
  })

  person
    .save()
    .then((savedPerson) => {
      resp.status(201).json(savedPerson)
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (req, resp, next) => {
  const id = req.params.id
  const { number } = req.body

  if (!number) {
    return resp.status(400).json({ error: 'number is required' })
  }

  Person.findByIdAndUpdate(id, { number }, { new: true })
    .then((updatedPerson) => {
      if (updatedPerson) {
        resp.status(200).json(updatedPerson)
      } else {
        resp.status(404).send('<h1>404 Not Found!</h1>').end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (req, resp, next) => {
  const id = req.params.id
  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      if (deletedPerson) {
        resp.json(204).end()
      } else {
        resp.status(404).send('<h1>404 Not Found! Person not found</h1>')
      }
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
