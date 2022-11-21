import { SessionOptions } from 'express-session'
import { SESSION_SECRET } from './dotenv'

export const sessionConfig: SessionOptions = {
  secret: SESSION_SECRET,
  name: '__sauth_session',
  cookie: { maxAge: 28800 },
}
