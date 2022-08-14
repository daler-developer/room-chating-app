import * as jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import collections from '../db/collections'
import { NotAuthenticatedError } from '../errors'

class TokensService {
  generateTokens(userId: ObjectId) {
    const accessToken = jwt.sign({ userId: userId.toString() }, 'jwt_secret', {
      expiresIn: '2 days',
    })
    const refreshToken = jwt.sign({ userId: userId.toString() }, 'jwt_secret', {
      expiresIn: '3 days',
    })

    return { accessToken, refreshToken }
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, 'jwt_secret' as any)
    } catch (e) {
      throw new NotAuthenticatedError()
    }
  }

  async saveRefreshToken(userId: ObjectId, refreshToken: string) {
    const token = await collections.tokens.findOne({ userId })

    if (token) {
      await collections.tokens.updateOne({ _id: token._id }, { $set: { refreshToken } })
    } else {
      await collections.tokens.insertOne({ userId, refreshToken })
    }
  }
}

export default new TokensService()
