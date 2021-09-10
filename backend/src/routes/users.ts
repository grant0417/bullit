import createQuery from '../createQuery';
import pool from '../db';
import express, { Request, Response } from 'express';
import argon2 from 'argon2';
import { createJwt } from '../jwt';

const router = express.Router();

router.get('/:name', async (req: Request, res: Response) => {
  const user = await pool.query(
    createQuery(
      [
        'users.username',
        'users.description',
        'users.time_created',
        'users.graduation_semester',
        'roles.name as role',
      ],
      'users LEFT JOIN roles on (users.role = roles.id)',
      {
        where: ['users.username = $1'],
      }
    ),
    [req.params.name]
  );

  if (user.rows.length === 0) {
    res.status(404).send({ error: 'User not found' });
  } else {
    res.send(user.rows[0]);
  }
});

router.get('/:name/role', async (req, res) => {
  const { name } = req.params;

  pool
    .query(
      createQuery(
        ['roles.name'],
        'users LEFT JOIN roles on (users.role = roles.id)',
        {
          where: ['users.username = $1'],
        }
      ),
      [name]
    )
    .then((result) => {
      if (result.rows.length === 0) {
        res.status(404).send({ error: 'User not found' });
      } else {
        res.send(result.rows[0]);
      }
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.post('/:name/role', async (req, res) => {
  const { role } = req.body;
  const { name } = req.params;

  pool
    .connect()
    .then(async (client) => {
      client
        .query(createQuery(['id'], 'roles', { where: ['name = $1'] }), [role])
        .then(async (result) => {
          if (result.rows.length === 0) {
            res.status(404).send({ error: 'Role not found' });
          } else {
            client
              .query('UPDATE users SET role = $1 WHERE username = $2', [
                result.rows[0].id,
                name,
              ])
              .then(() => {
                res.sendStatus(200);
              });
          }
        })
        .finally(() => {
          client.release();
        });
    })
    .catch((err) => {
      res.sendStatus(500);
    });
});

router.post('/', async (req: Request, res: Response) => {
  const { username, password, email } = req.body;

  if (!username || !password) {
    res.status(400).send({ error: "'username' and 'password' required" });
    return;
  }

  if (password.length < 8) {
    res.status(400).send({ error: 'Password must be at least 8 characters' });
    return;
  }

  pool
    .query('SELECT 1 FROM users WHERE username = $1', [username])
    .then((result) => {
      if (result.rows.length > 0) {
        res.status(400).send({ error: 'Username already exists' });
      } else {
        argon2.hash(password).then((hash) => {
          pool
            .query(
              'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)',
              [username, hash, email]
            )
            .then(() => {
              const token = createJwt(username);

              res.cookie('token', token, {
                httpOnly: true,
                sameSite: 'strict',
                // secure: true,
                expires: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000
                ),
              });
              res.cookie('username', username, {
                expires: new Date(
                  Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000
                ),
              });
              res.send({ username, role: 'user' });
            });
        });
      }
    })
    .catch((_err) => {
      res.sendStatus(500);
    });
});

export default router;
