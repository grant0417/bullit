import { Request, Response, NextFunction } from 'express';
import pool from '../db';
import { verifyJwt } from '../jwt';

const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  if (req.cookies?.token) {
    verifyJwt(req.cookies.token)
      .then((username) => {
        pool
          .query(
            'SELECT roles.name as role FROM users LEFT JOIN roles ON (users.role = roles.id) WHERE users.username = $1',
            [username]
          )
          .then((result) => {
            if (result.rowCount === 1) {
              req.user = { username, role: result.rows[0].role };
            }
          })
          .catch((err) => {})
          .finally(() => {
            next();
          });
      })
      .catch((err) => {
        next();
      });
  } else {
    next();
  }
};

export default authMiddleware;
