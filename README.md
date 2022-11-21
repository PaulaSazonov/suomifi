# A reference for Suomi.fi authentication service

## A TypeScript, Node.js & Express API for SAML authentication with suomi.fi

This serves as a reference for building an authentication service with suomi.fi e-identification, using SAML (Security Assertion Markup language). This was built using the library [suomifi-passport-saml](https://github.com/vrk-kpa/suomifi-passport-saml), but since in the fall of 2022 it was announced that the library will not be maintained no longer, this api should only be used as a reference and will be archived as well. Future NodeJS services should be designed using [node-saml](https://github.com/node-saml), per suomi.fi recommendation.

## About this service

SAML messages are generated using a library called [suomifi-passport-saml](https://github.com/vrk-kpa/suomifi-passport-saml). Suomi.fi acts as an Identity Provider (IdP), and this service as the Service Provider (SP) in the SAML authentication flow. See technical description of the suomi.fi interface in their [documentation](https://palveluhallinta.suomi.fi/en/tuki/artikkelit/59116c3014bbb10001966f70). The documentation includes a [sequence diagram](https://palveluhallinta.suomi.fi/storage/cms.files/J3TK7hx5CIMVdv4r.png) of the flow.

Suomi.fi requires that the SP implements the following six use cases:

- sending an identification request
- receiving an identification response
- sending a logout request
- receiving a logout request
- receiving a logout response
- sending a logout response.

[General technical description of suomi.fi](https://palveluhallinta.suomi.fi/en/sivut/tunnistus/yleiskuvaus)

Useful tools for debugging SAML messages: For Chrome or Firefox, "SAML tracer" (great for visualizing the entire SAML flow), also for Chrome: "SAML Chrome Panel"

## The metadata

A service is registered with the IdP using a metadata XML file. This file has strict format requirements, see [documentation](https://palveluhallinta.suomi.fi/en/tuki/artikkelit/590adae814bbb10001966f53) for more information. Details on the SAML configuration of this service and how this correlates with the metadata can be found under "SAML configuration" in this ReadMe.

The suomifi-passport-saml provides a method `generateServiceProviderMetadata` to generate a metadata file, but it does not fill the requirements from suomi.fi out of the box.

## Login process (SAML SSO - Single Sign-On)

The authentication flow begins with a request to /login endpoint. Language ('fi', 'sv', 'en') is passed as a query parameter, or defaults to Finnish. This language option is passed to the library, and defines in which language the authentication takes place in suomi.fi. Passing the /login request to `passport.authenticate()` middleware initiates the authentication process, a SAML authentication request (AuthnRequest) is generated and sent to the IdP (specifically to the `entryPoint` defined in your saml config). User is redirected to the IdP, and after successfully completing the strong authentication at suomi.fi (using e.g. bank credentials), the user is directed back to this service.

Behind the scenes during the authentication at suomi.fi, a SAML authentication response is sent to the endpoint /SAML2/ACS/POST. This response is handled by the `passport.authenticate()` middleware (decrypted and signature validated). If a user interrupts the authentication process at suomi.fi, an error response is sent. The `logoutInterruptionHandler` catches this error, and the user is redirected to the /failed endpoint.

On successful authentication, IdP returns the user's name (in two formats, you can use either lastname + all first names, or firstname + lastname. Currently using only the latter), and the user's Social Security Number (SSN). Passport authentication middleware's `verifyFn`, would be the place to the verify the user e.g. by checking if a strong hash of user's SSN is found in the database and return the user's id.

The root endpoint '/' could then check if the authenticated user has an id, and if they do, generate a valid access token and redirects the user to their final destination with the token. If the id would be null, that could indicate the authentication process via IdP was successful, but the user is not authorized for this exact service (if a database of authorized users is kept), so no access token is generated.

## Logout process (SAML SLO - Single Logout)

Logout process is initiated with a request to the /logout endpoint. More specifically, this initiates the SP requested SLO, which means the logout process is initiated by our service. The suomifi-passport-saml library's `logout()` is called, which generates the LogoutRequest and sends it to the IdP.

The endpoint /SAML2/SLO/REDIRECT implements the last three use cases required by suomi.fi. It handles receiving a SAML LogoutResponse from the IdP, after we have initiated the SLO process. It also handles receiving a SAML LogoutRequest from the IdP, and responding with a SAML LogoutResponse. The latter case is to terminate the authentication session within suomi.fi, if a logout is initiated by an another SP. The authentication session within suomi.fi is valid for 32 minutes, during that time you could authenticate to multiple services that use suomi.fi (Vero, Kela, etc.), and this just means that if the authentication session is terminated in one service, it is terminated in all of them.

## SAML configuration

- `callbackUrl`: the url where the IdP sends the authentication response. This is specified as the `AssertionConsumerService Location` in the metadata file. Must be POST endpoint.
- `entryPoint`: the IdP url where the authentication request is sent. suomi.fi has separate REDIRECT/POST urls for sending the request, and suomifi-passport-saml also supports both methods, **but** it is recommended to use the HTTP-Redirect, because you might run into compression issues with other endpoints' SAML processing otherwise ([issue](https://github.com/node-saml/passport-saml/issues/241))
- `logoutUrl`: the IdP url where the logout request is sent.
- `issuer`: the EntityID you have provided to the IdP in the metadata (in our case the service url). Note, this must match exactly to the EntityID in the metadata
- `cert`: The IdP public key (public PEM-encoded X.509 signing certificate), to verify the signature of the SAML messages. Suomi.fi also has their own metadata files (separate for testing and production environment), and you can obtain this public signing cert from their metadata. If you can't find the metadata files from the docs (they are a maze), ask the latest straight from their support. Info acquired straight from the support (not found in their docs): suomi.fi has two metadatas for both environments: usually labeled `metadata` and `metadata-secondary`. The secondary metadatas contain only one public cert, the other contains both a current cert, and a new cert. You can use multiple certificates to handle rolling of the certs without interruptions. Rolling of the certs will happen periodically, and will be notified in advance by suomi.fi. This `cert` property can be a string representing a single cert, or an array which contains multiple public certs, for rolling from old to new. In this service, multiple certificates are used, `cert` is an array containing the env variables `SAML_MULTI_CERT_CURRENT` and `SAML_MULTI_CERT_UPCOMING`
- `decryptionPvk`: the private key to decrypt the encrypted assertions (SAML messages)
- `privateCert`: this private key, that correlates with the signing certificate (public key) provided in our metadata to the IdP. The SAML messages must be signed with this private certificate.
- `audience`: the expected SAML response audience, the EntityID of our service (the same as in `issuer`)
- `disableRequestedAuthnContext`: must be set to `true`, to not demand exact authentication methods. This was suggested by the suomi.fi support, said it is not necessary and will only do us harm instead of good.
  (Authentication Context is used to define how the user authenticates with the IdP, to set up the Auth Context correctly, you would need to define all the authentication methods you listed as supported methods of authentication in your IdP metadata.)
- `identifierFormat`: NameIDFormat must be set to transient, by using value `urn:oasis:names:tc:SAML:2.0:nameid-format:transient` for this property
- `signatureAlgorithm`: the signature algorithm for signing requests, use `sha256` for this Idp (this information can be found from the IdP's metadata)
- `digestAlgorithm`: the digest algorithm used to provide a digest for the signed data object, use `sha256` for this IdP (this information can be found from the IdP's metadata)
- `validateInResponseTo`: must be `true`, this IdP requires InResponseTo (= to what request the response is for) to be validated from incoming SAML responses
- `cacheProvider`: when InResponseTo validation is turned on, suomifi-passport-saml will store generated request ids used in SAML requests to the IdP. Since this validation is required for suomi.fi, we must have a working cache in place. The library provides an in-memory cache, but this is not sufficient in our server environment, so an outside cache provider must be set up.

## Environment variables

The required environment variables for the service are:

- SAML_IDP_DOMAIN
- SAML_ENTRYPOINT
- SAML_SP_DOMAIN
- SAML_LOGOUTURL
- SAML_MULTI_CERT_CURRENT
- SAML_MULTI_CERT_UPCOMING
- SAML_DECRYPT_KEY
- SAML_SIGNING_KEY
- PORT
- JWT_SECRET
- JWT_EXP

## Maintenance

Likely maintenance operations for the service include updating the environment variables `SAML_MULTI_CERT_CURRENT` and `SAML_MULTI_CERT_UPCOMING` when suomi.fi notifies about rolling of the public certificates.

Also the certificates in use for signing and encrypting the SAML messages (must be CA issued certificates in production) usually have an expiration. Currently the expiration is not validated by suomi.fi, but they said this could change in the future. If these certificates need to be updated, the public certs have to be provided to suomi.fi in an updated metadata file (elements `md:KeyDescriptor use="signing"` and `md:KeyDescriptor use="encryption"` in the metadata), and the correlating private certs must be updated to the environment variables `SAML_SIGNING_KEY` and `SAML_DECRYPT_KEY`
There might be a slight interruption of service when suomi.fi makes the new installation with the updated metadata (production installations are usually done on Wednesdays around 9.30-10.30, maybe update the environment variables as soon as a confirmation of the production installation is received).
