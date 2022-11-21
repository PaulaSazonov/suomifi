import express from 'express'
import passport from 'passport'
import { Strategy } from 'passport-saml/lib/passport-saml'
import session from 'express-session'
import { SAML_IDP_DOMAIN, PORT } from './config/dotenv'
import samlStrategy from './config/saml'
import router from './routes/router'
import { SessionUserData, User } from './typings/types'
import { sessionConfig } from './config/session'

const app = express()

app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())

// NOTE: `ALLOW-FROM` is not supported in most browsers, but suomi.fi requires this in their docs
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', `ALLOW-FROM ${SAML_IDP_DOMAIN}`)
  next()
})

app.use('/', router)

passport.serializeUser<SessionUserData>((user: any, done) => {
  done(null, {
    UUID: user.UUID,
    nameID: user?.nameID,
    nameIDFormat: user?.nameIDFormat,
  })
})

passport.deserializeUser<SessionUserData>((user: any, done) => {
  done(null, user)
})
passport.use(samlStrategy as Strategy)

app.listen(+PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${PORT}`)
})
