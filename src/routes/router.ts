import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
  response,
} from 'express'
import passport from 'passport'
import { AuthenticateOptions } from 'passport-saml'
import { RequestWithUser } from 'passport-saml/lib/passport-saml/types'
import redisCache from '../config/cache'
import samlStrategy, { samlConfig } from '../config/saml'
import logoutInterruptionHandler from '../services/errorhandler'
import errorLogger from '../services/errorLogger'
import generateAuthToken from '../services/jwt'
import { SuomifiAuthenticateOptions, User } from '../typings/types'

const router = express.Router({ strict: true })

const authenticateOptions: AuthenticateOptions = {
  successRedirect: '/',
  failureRedirect: '/failed',
  failureFlash: true,
}

const redirectToLogin = (req: Request, res: Response, next: NextFunction) =>
  !req.isAuthenticated || !req.user ? res.redirect('/login') : next()

router.get('/', redirectToLogin, (req: Request, res: Response) => {
  const { user } = req
  if (user) {
    const token = generateAuthToken(req.user as User)
    res.cookie('__test_access_token', token, {
      secure: true,
      httpOnly: true,
    })
    return res.redirect('/success')
  }
  return res.redirect('/unauthorized')
})

router.get('/success', redirectToLogin, (req, res) =>
  res.status(200).send('You have been successfully logged in and redirected!'),
)

router.get('/unauthorized', (req, res) => {
  res.status(401).send("You are not authorized, we're very exclusive here.")
})

router.get('/failed', (req, res) => {
  res.status(418).send('Login failed')
})

/**
 * SP initiates SSO (Single Sign-On), sends Authentication Request
 */
router.get(
  '/login',
  (req: Request, res: Response, next: NextFunction) =>
    passport.authenticate(
      'saml',
      {
        ...authenticateOptions,
        vetumaLang: req.query.lng ?? 'fi',
      } as SuomifiAuthenticateOptions,
      () => {
        next()
      },
    )(req, res, next),
  (req, res) => res.redirect('/'),
)

/**
 * Receive Authentication Response from IdP,
 * error handler for user initiated interruption
 */
router.post(
  '/SAML2/ACS/POST',
  passport.authenticate('saml', authenticateOptions) as RequestHandler,
  logoutInterruptionHandler,
)

/**
 * SP initiates SLO (Single LogOut), generates LogoutRequest
 */
router.get('/logout', (req: Request, res: Response) => {
  if (req.user) {
    return samlStrategy.logout(
      req as RequestWithUser,
      samlConfig,
      (err: Error | null, url: string | null | undefined) => {
        if (!err) {
          return req.logout(() => res.redirect(url ?? '/'))
        }
        console.error(err)
        res.clearCookie('__test_access_token')
        return req.logout(() => res.redirect('/login'))
      },
    )
  }
  if (req.session) {
    req.session
  }
  return res.redirect('/login')
})

const logoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.session) {
    req.session.destroy(errorLogger)
  }
  // The local session should be properly terminated here when the cache is implemented
  req.logout(errorLogger)
  res.clearCookie('__test_access_token')
  next()
}

/**
 * IdP notifies logout, possible cases:
 * 1: SP requested logout, IdP confirms logout.
 * 2: IdP request logout after receive logout request from another SP that shared a session.
 */
router.get(
  '/SAML2/SLO/REDIRECT',
  (req, res, next) => {
    passport.authenticate('saml', logoutHandler)(req, res, next)
  },
  (req, res) => res.redirect('/login'),
)

export default router
