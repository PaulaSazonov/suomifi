import * as dotenv from 'dotenv'

dotenv.config()
const path = `${__dirname}/../../.env`

dotenv.config({ path })

declare const process: {
  env: {
    PORT: string
    SAML_SP_DOMAIN: string
    SAML_IDP_DOMAIN: string
    SAML_ENTRYPOINT: string
    SAML_LOGOUTURL: string
    SAML_MULTI_CERT_CURRENT: string
    SAML_MULTI_CERT_UPCOMING: string
    SAML_DECRYPT_KEY: string
    SAML_SIGNING_KEY: string
    JWT_SECRET: string
    JWT_EXP: string
    SESSION_SECRET: string
    REDIS_PW: string
    REDIS_HOST: string
  }
}

export const {
  PORT,
  SAML_SP_DOMAIN,
  SAML_IDP_DOMAIN,
  SAML_ENTRYPOINT,
  SAML_LOGOUTURL,
  SAML_MULTI_CERT_CURRENT,
  SAML_MULTI_CERT_UPCOMING,
  SAML_DECRYPT_KEY,
  SAML_SIGNING_KEY,
  JWT_SECRET,
  JWT_EXP,
  SESSION_SECRET,
  REDIS_PW,
  REDIS_HOST,
} = process.env
