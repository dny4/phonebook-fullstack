const mongoose = require('mongoose')

const URI = process.env.MONGODB_URI
mongoose.connect(URI)
  .then()
  .catch(error => console.logg(error))

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name required'],
    minLength: 3
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: value => /\d{2,3}-\d{7}/.test(value),
      message: props => `${props.value} is not valid phone number`
    },
    required: [true, 'Phone number required']
  }
})

contactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Contact', contactSchema)


