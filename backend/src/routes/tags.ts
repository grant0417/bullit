import express, { Request, Response } from 'express';
import pool from '../db';

const router = express.Router();

router.get('/:name', (req: Request, res: Response) => {
  pool
    .query('SELECT * FROM tags WHERE name = ?', [req.params.name])
    .then((rows) => {
      res.json(rows);
    })
    .catch(() => {
      res.status(404).json({
        errorMessage: 'Not found',
      });
    });
});

router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400).json({
      errorMessage: 'Name is required',
      details: [
        {
          field: 'name',
          message: 'Required',
        },
      ],
    });
    return;
  }

  if (req.user) {
    pool.query(
      'INSERT INTO tags (tag_name, creator, description) VALUES ($1, select id from users where username = $2, $3)',
      [name, req.user.username, description]
    );
    res.json({
      success: true,
    });
  } else {
    res.status(401).json({
      errorMessage: 'Unauthorized',
    });
  }
});

router.get('/search/:query', (req: Request, res: Response) => {
  const { query } = req.params;

  pool
    .query('SELECT tag_name, description FROM tags WHERE tag_name LIKE $1', [`%${query}%`])
    .then((result) => {
      res.json(result.rows);
    })
    .catch((e) => {
      console.log(e);
      res.status(404).json({
        errorMessage: 'Not found',
      });
    });
});

const createTag = 'INSERT INTO tags (tag_name, description) VALUES ($1, $2)';

export default router;
