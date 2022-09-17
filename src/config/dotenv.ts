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
    SAML_CERT: string
    SAML_DECRYPT_KEY: string
    SAML_SIGNING_KEY: string
  }
}

export const {
  PORT,
  SAML_SP_DOMAIN,
  SAML_IDP_DOMAIN,
  SAML_ENTRYPOINT,
  SAML_LOGOUTURL,
  SAML_CERT,
  SAML_DECRYPT_KEY,
  SAML_SIGNING_KEY,
} = process.env
