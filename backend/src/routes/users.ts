import createQuery from '../createQuery';
import pool from '../db';
import express, { Request, Response } from 'express';
import argon2 from 'argon2';
import { createJwt, setJwtCookie } from '../jwt';

const router = express.Router();

router.get('/:name', async (req: Request, res: Response) => {
  const user = await pool.query(
    createQuery(
      [
        'users.username',
        'users.description',
        'users.time_created',
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
    .catch(() => {
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
    res.status(400).send({
      errorMessage: 'Username and password are required',
      details: [
        {
          field: 'username',
          message: 'Required',
        },
        {
          field: 'password',
          message: 'Required',
        },
      ],
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).send({
      errorMessage: 'Password must be at least 8 characters long',
      details: [
        {
          field: 'password',
          message: 'Must be at least 8 characters long',
        },
      ],
    });
    return;
  }

  if (username.length < 3) {
    res.status(400).send({
      errorMessage: 'Username must be at least 3 characters long',
      details: [
        {
          field: 'username',
          message: 'Must be at least 3 characters long',
        },
      ],
    });
    return;
  }

  // Validate Email
  if (email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(String(email).toLowerCase())) {
      res.status(400).send({
        errorMessage: 'Email is not valid',
        details: [
          {
            field: 'email',
            message: 'Must be a valid email address',
          },
        ],
      });
      return;
    }
  }

  pool
    .query('SELECT 1 FROM users WHERE username = $1', [username])
    .then((result) => {
      if (result.rows.length > 0) {
        res.status(400).send({
          errorMessage: 'Username already exists',
          details: [
            {
              field: 'username',
              message: 'Username already exists',
            },
          ],
        });
      } else {
        argon2.hash(password).then((hash) => {
          pool
            .query(
              'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3)',
              [username, hash, email]
            )
            .then(async () => {
              await setJwtCookie(res, username);
              res.send({ username, role: 'user' });
            });
        });
      }
    })
    .catch(() => {
      res.sendStatus(500);
    });
});

router.post('/description', async (req, res) => {
  const { description } = req.body;

  if (req.user) {
    pool
      .query(
        'UPDATE users SET description = $1 WHERE username = $2 RETURNING description',
        [description, req.user.username]
      )
      .then((row) => {
        console.log(row);
        res.send(row.rows[0]);
      })
      .catch(() => {
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

export default router;
