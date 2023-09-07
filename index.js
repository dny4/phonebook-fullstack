require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Contact = require('./models/contacts')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    JSON.stringify(req.body)
  ].join(' ')
}))

app.get('/', (request, response, next) => {
  response.status(200).end('<h1>Phonebook Backend</h1>')
})

app.get('/api/contacts', (request, response) => {
  Contact.find({})
    .then(result => response.json(result))
    .catch(error => next(error)
    )
})

app.get('/info', (request, response, next) => {
  Contact.find({})
    .then(contacts => {
      response.status(200).send(`
        <p>Phonebook has info for ${contacts.length} people</p>
        <p>${new Date()}</p>
        `)
    })
    .catch(error => next(error))
})


app.get('/api/contacts/:id', (request, response, next) => {
  const id = Number(request.params.id)
  Contact.findById(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/contacts/:id', (request, response, next) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(contact => {
      if (contact) {
        response.json(contact)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/contacts', (request, response, next) => {
  // check content validity
  const { name, number } = request.body
  // modify
  const contact = new Contact(
    {
      name: name,
      number: number
    }
  )
  contact.save()
    .then(result => {
      response.status(201).json(result)
    })
    .catch(error => next(error))
})

app.put('/api/contacts/:id', (request, response, next) => {
  const id = request.params.id
  const update = { number: request.body.number }
  Contact.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(contact => response.json(contact))
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error)
  if (error.name == 'CastError') {
    response.status(400).json({ error: 'invalid id' })
  } else if (error.name == 'ValidationError') {
    response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = 3001
app.listen(PORT, () => console.log(`Listening on ${PORT}`))
