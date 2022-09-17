import express from 'express'
import passport from 'passport'
import { SAML_IDP_DOMAIN, PORT } from './config/dotenv'

const app = express()

app.use(passport.initialize())

// NOTE: `ALLOW-FROM` is not supported in most browsers, but suomi.fi requires this in their docs ?
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', `ALLOW-FROM ${SAML_IDP_DOMAIN}`)
  next()
})

app.listen(+PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is listening on port ${PORT}`)
})
