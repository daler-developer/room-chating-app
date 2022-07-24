import * as jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import collections from '../db/collections'

class TokensService {

  generateTokens (userId: ObjectId) {
    const accessToken =  jwt.sign({ userId: userId.toString() }, 'jwt_secret', { expiresIn: '1h' })
    const refreshToken = jwt.sign({ userId: userId.toString() }, 'jwt_secret', { expiresIn: '2 days' })

    return { accessToken, refreshToken }
  }

  verifyToken (token: string) {
    return jwt.decode(token, 'jwt_secret' as any)
  }

  async saveRefreshToken (userId: ObjectId, refreshToken: string) {
    const token = await collections.tokens.findOne({ userId })

    if (token) {
      await collections.tokens.updateOne({ _id: token._id }, { $set: { refreshToken } })
    } else {
      await collections.tokens.insertOne({ userId, refreshToken })
    }
  }

}

export default new TokensService()
