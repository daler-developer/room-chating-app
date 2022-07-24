import { MongoClient } from 'mongodb'

const client = new MongoClient(
  'mongodb://localhost:27017/messenger',
  {
    maxPoolSize:50,
    wtimeoutMS: 2500
  }
)

export default client
