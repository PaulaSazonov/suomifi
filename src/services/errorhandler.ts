import { Request, Response, NextFunction } from 'express'

/**
 * This middleware function is required to handle the situation
 * where a user deliberately interrupts the SLO at suomi.fi,
 * the library throws an error at the error response from IDP
 * and this doesn't fall under passport's failureRedirect
 */

const logoutInterruptionHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error('INTERRUPTION HANDLER: ', err)
  res.redirect('/failed')
}

export default logoutInterruptionHandler
