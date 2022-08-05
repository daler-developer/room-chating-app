import { MongoClient } from 'mongodb'

const client = new MongoClient(
  'mongodb+srv://daler-developer:2000909k@cluster0.w93fir2.mongodb.net/?retryWrites=true&w=majority',
  {
    maxPoolSize:50,
    wtimeoutMS: 2500
  }
)

export default client
