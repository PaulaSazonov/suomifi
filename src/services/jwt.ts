import jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_EXP } from '../config/dotenv'
import { User } from '../typings/types'

const generateAuthToken = (authenticatedUser: User): string => {
  const token = jwt.sign(
    {
      name: authenticatedUser.displayName,
      uuid: authenticatedUser.UUID,
      exp: Math.floor(Date.now() / 1000) + parseInt(JWT_EXP, 10) * 60 * 60,
      nbf: Math.floor(Date.now() / 1000),
      sub: authenticatedUser.UUID,
      iss: 'test-suomi.fi-auth',
    },
    JWT_SECRET,
  )
  return token
}

export default generateAuthToken
