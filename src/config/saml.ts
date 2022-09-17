import { Strategy } from 'suomifi-passport-saml'
import { Profile, User } from '../typings/types'
import {
  SAML_SP_DOMAIN,
  SAML_ENTRYPOINT,
  SAML_CERT,
  SAML_DECRYPT_KEY,
  SAML_LOGOUTURL,
  SAML_SIGNING_KEY,
} from './dotenv'

export const samlConfig = {
  callbackUrl: `${SAML_SP_DOMAIN}/SAML2/ACS/POST`,
  entryPoint: SAML_ENTRYPOINT,
  logoutUrl: SAML_LOGOUTURL,
  issuer: SAML_SP_DOMAIN,
  cert: SAML_CERT,
  decryptionPvk: SAML_DECRYPT_KEY,
  privateCert: SAML_SIGNING_KEY,
  audience: SAML_SP_DOMAIN,
  disableRequestedAuthnContext: true,
  identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  signatureAlgorithm: 'sha256',
  digestAlgorithm: 'sha256',
  suomifiAdditions: {
    disableValidateInResponseEnforcementForUnitTestingPurposes: true, // for now, until validating from cache works
  },
}

// TODO: implementation, typings
export const verifyFn = (profile: Profile, done) => {
  try {
    const displayName = profile['urn:oid:2.16.840.1.113730.3.1.241'] // firstname + lastname
    const commonName = profile['urn:oid:2.5.4.3'] // lastname + all first names
    // validate user and get id
    const user: User = {
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
  } catch (err) {
    console.error('ERROR VERIFYING USER: ', err)
    return done(err)
  }
}

const samlStrategy = new Strategy(samlConfig, verifyFn)

export default samlStrategy
