require('dotenv').config();

import express, { Response, Request } from 'express';
import helmet from 'helmet';
import argon2 from 'argon2';
import cookieParser from 'cookie-parser';
import pool, { migrate } from './db';
import authMiddleware from './middleware/authMiddleware';
import { setJwtCookie } from './jwt';
import posts from './routes/posts';
import users from './routes/users';
import tags from './routes/tags';

async function startApp(port: number) {
  const app = express();

  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(authMiddleware);

  app.use('/api/posts', posts);
  app.use('/api/users', users);
  app.use('/api/tags', tags);

  app.post('/api/login', (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send({ error: "'username' and 'password' required" });
      return;
    }

    pool
      .connect()
      .then(async (client) => {
        const sqlResult = await client.query(
          'SELECT users.password_hash, roles.name as role FROM users LEFT JOIN roles on (users.role = roles.id) WHERE users.username = $1',
          [username]
        );
        client.release();

        if (sqlResult.rowCount === 0) {
          res.status(400).send({ error: 'Username does not exist' });
          return;
        }

        const match = await argon2.verify(
          sqlResult.rows[0].password_hash,
          password
        );

        if (!match) {
          res.status(400).send({ error: 'Incorrect password' });
          return;
        }

        await setJwtCookie(res, username);
        res.send({ username, role: sqlResult.rows[0].role });
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  });

  app.post('/api/logout', (_: Request, res: Response) => {
    res.clearCookie('token');
    res.clearCookie('username');
    res.send();
  });

  app.listen(port, () => {
    console.log('server is up on port: ' + port);
  });
}

migrate();
startApp(8800).catch(console.log);
