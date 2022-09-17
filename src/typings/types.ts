export type User = {
  displayName: string
  commonName: string
  UUID: string | null
  nameID: string // necessary for saml logout
  nameIDFormat: string // necessary for saml logout
  sessionIndex: string // necessary for saml logout
  spNameQualifier: string // necessary for saml logout
  nameQualifier: string // necessary for saml logout
  inResponseTo: string // needs to be saved in cache so can be validated for incoming saml responses
}

export type Profile = {
  nameID: string
  nameIDFormat: string
  sessionIndex: string
  spNameQualifier: string
  nameQualifier: string
  inResponseTo: string
  'urn:oid:1.2.246.21': string // ssn
  'urn:oid:2.16.840.1.113730.3.1.241': string // firstname + lastname
  'urn:oid:2.5.4.3': string // lastname + all first names
}
