import express, {
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express'
import passport from 'passport'
import { AuthenticateOptions } from 'passport-saml'
import samlStrategy, { samlConfig } from '../config/saml'

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

router.get(
  '/login',
  passport.authenticate('saml', authenticateOptions) as RequestHandler,
  (_req, res) => res.redirect('/'),
)

router.get('/logout', (req: Request, res: Response) => {
  if (req.user) {
    return samlStrategy.logout(
      req,
      samlConfig,
      (err: Error | null, uri: string | undefined) => {
        if (!err) {
          // req.logout?
          return res.redirect(uri ?? '/')
        }
        console.error(err)
        // req.logout() ?
        return res.redirect('/login')
      },
    )
  }
  return res.redirect('/login')
})

export default router
