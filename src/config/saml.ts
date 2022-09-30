import {
  Profile,
  SamlConfig,
  VerifiedCallback,
  VerifyWithoutRequest,
} from 'passport-saml'
import { Strategy } from 'suomifi-passport-saml'
import { SamlStrategy } from '../typings/types'
import {
  SAML_SP_DOMAIN,
  SAML_ENTRYPOINT,
  SAML_CERT,
  SAML_DECRYPT_KEY,
  SAML_LOGOUTURL,
  SAML_SIGNING_KEY,
} from './dotenv'

type Config = SamlConfig & {
  digestAlgorithm?: 'sha1' | 'sha256' | 'sha512' | undefined
  suomifiAdditions: {
    disableValidateInResponseEnforcementForUnitTestingPurposes: boolean
  }
}

export const samlConfig: Config = {
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
export const verifyFn: VerifyWithoutRequest = (
  profile: Profile,
  done: VerifiedCallback,
) => {
  try {
    const displayName = profile['urn:oid:2.16.840.1.113730.3.1.241'] // firstname + lastname
    const commonName = profile['urn:oid:2.5.4.3'] // lastname + all first names
    // validate user and get id
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
  } catch (err) {
    console.error('ERROR VERIFYING USER: ', err)
    return done(err as Error)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const samlStrategy = new Strategy(samlConfig, verifyFn) as SamlStrategy

export default samlStrategy
