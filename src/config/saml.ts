// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings/suomifi-passport-saml.d.ts" />

import { Strategy } from 'suomifi-passport-saml'
import {
  Profile,
  VerifiedCallback,
  VerifyWithoutRequest,
} from '../typings/types'
import redisCache from './cache'
import {
  SAML_SP_DOMAIN,
  SAML_ENTRYPOINT,
  SAML_DECRYPT_KEY,
  SAML_LOGOUTURL,
  SAML_SIGNING_KEY,
  SAML_MULTI_CERT_CURRENT,
  SAML_MULTI_CERT_UPCOMING,
} from './dotenv'

export const samlConfig = {
  callbackUrl: `${SAML_SP_DOMAIN}/SAML2/ACS/POST`,
  entryPoint: SAML_ENTRYPOINT,
  logoutUrl: SAML_LOGOUTURL,
  issuer: SAML_SP_DOMAIN,
  cert: [SAML_MULTI_CERT_CURRENT, SAML_MULTI_CERT_UPCOMING],
  decryptionPvk: SAML_DECRYPT_KEY,
  privateCert: SAML_SIGNING_KEY,
  audience: SAML_SP_DOMAIN,
  disableRequestedAuthnContext: true,
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  cacheProvider: redisCache,
  validateInResponsoTo: true,
}

export const verifyFn: VerifyWithoutRequest = (
  profile: Profile | null | undefined,
  done: VerifiedCallback,
) => {
  try {
    if (profile) {
      const displayName = profile['urn:oid:2.16.840.1.113730.3.1.241'] // firstname + lastname
      const commonName = profile['urn:oid:2.5.4.3'] // lastname + all first names
      // This is where you could validate the user exists in db, get id
      const user = {
        displayName,
        commonName,
        UUID: 'todo',
        nameID: profile.nameID,
        nameIDFormat: profile.nameIDFormat,
        sessionIndex: profile.sessionIndex,
        spNameQualifier: profile.spNameQualifier,
        nameQualifier: profile.nameQualifier,
        inResponseTo: profile.inResponseTo,
      }
      return done(null, user)
    }
    return done(new Error('No profile to verify'))
  } catch (err) {
    console.error('ERROR VERIFYING USER: ', err)
    return done(err as Error)
  }
}

const samlStrategy = new Strategy(samlConfig, verifyFn)
export default samlStrategy
