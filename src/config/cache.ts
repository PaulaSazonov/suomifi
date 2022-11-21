import client from './redis'

/**
 * When InResponseTo validation is turned on, Passport-SAML will store generated request ids used in SAML requests to the IdP.
 * The implementation of how things are stored, checked to see if they exist, and eventually removed is from the Cache Provider used by Passport-SAML.
 * The default implementation is a simple in-memory cache provider. For multiple server/process scenarios,
 * this will not be sufficient as the server/process that generated the request id and stored in memory could be different than the server/process handling the SAML response.
 * The InResponseTo could fail in this case erroneously.
 * To support this scenario you can provide an implementation for a cache provider by providing an object with save, get, remove functions.
 * provide an instance of an object which has these functions passed to the cacheProvider config option when using Passport-SAML.
 */
const { exists, get, set, del } = client

const redisCache = {
  save: function (key: string, value: any, callback: Function): void {
    // save the key with the optional value, invokes the callback with the value saves

    exists(key)
      .then((result) => {
        if (!result) {
          set(key, value)
            .then((result) => {
              callback(null, value)
            })
            .catch((err) => {
              console.error('ERROR hSet: ', err)
              callback(null, null)
            })
        } else {
          callback(null, null)
        }
      })
      .catch((err) => {
        console.error('ERROR hExists hSet: ', err)
        callback(null, null)
      })
  },
  get: function (key: string, callback: Function): void {
    // invokes 'callback' and passes the value if found, null otherwise

    exists(key)
      .then((result) => {
        if (result) {
          get(key)
            .then((result) => {
              callback(null, result)
            })
            .catch((err) => {
              console.error('ERROR hGet: ', err)
              callback(null, null)
            })
        } else {
          callback(null, null)
        }
      })
      .catch((err) => {
        console.error('ERROR hExists hGet: ', err)
        callback(null, null)
      })
  },
  remove: function (key: string, callback: Function): void {
    // removes the key from the cache, invokes `callback` with the
    // key removed, null if no key is removed

    exists(key)
      .then((result) => {
        if (result) {
          del(key)
            .then((result) => {
              callback(null, key)
            })
            .catch((err) => {
              console.error('ERROR hDel: ', err)
              callback(null, null)
            })
        } else {
          callback(null, null)
        }
      })
      .catch((err) => {
        console.error('ERROR hExists hDel: ', err)
        callback(null, null)
      })
  },
}

export default redisCache
