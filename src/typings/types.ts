import { AuthenticateOptions } from 'passport'
import * as PassportSaml from 'passport-saml'

export interface User extends Profile {
  displayName: string
  commonName: string
  UUID: string | null
}

export type VerifyWithoutRequest = (
  profile: Profile | null | undefined,
  done: VerifiedCallback,
) => void

export type VerifiedCallback = PassportSaml.VerifiedCallback

export interface Profile extends PassportSaml.Profile {
  inResponseTo: string
  'urn:oid:1.2.246.21': string // ssn
  'urn:oid:2.16.840.1.113730.3.1.241': string // firstname + lastname
  'urn:oid:2.5.4.3': string // lastname + all first names
}

export interface SamlConfig extends PassportSaml.SamlConfig {
  digestAlgorithm?: 'sha1' | 'sha256' | 'sha512' | undefined
  privateCert: string
  suomifiAdditions: {
    disableValidateInResponseEnforcementForUnitTestingPurposes: boolean
  }
}

export interface SuomifiAuthenticateOptions extends AuthenticateOptions {
  vetumaLang: string
}
