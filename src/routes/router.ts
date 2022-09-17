import express, { Request, Response, NextFunction } from 'express'
import passport, { AuthenticateOptions } from 'passport'

const router = express.Router({ strict: true })

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
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  passport.authenticate('saml', {
    successRedirect: '/',
    failureRedirect: '/failed',
    failureFlash: true,
  } as AuthenticateOptions),
  (_req, res) => res.redirect('/'),
)

router.get('/logout', (_req, _res) => {
  // TODO
})
