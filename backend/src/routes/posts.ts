import createQuery from '../createQuery';
import pool from '../db';
import express, { Request, Response } from 'express';

const router = express.Router();

router.get(
  '/',
  (req: Request<{ user: string; sort: string }>, res: Response) => {
    const { user: userQuery, sort: sortQuery, page } = req.query;

    const pageSize = 25;

    let sqlColumns = [
      'posts.id',
      'posts.title',
      'posts.url_link',
      'posts.time_posted',
      'users.username',
      'roles.name as role',
      'posts.approved',
      'COALESCE((SELECT sum(post_votes.vote_value) FROM post_votes WHERE post_votes.post_id = posts.id), 0) as votes',
      'count(posts)'
    ];

    let sqlFrom =
      'posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)';

    let sqlOrder: string[] = [];
    let sqlWhere: string[] = [];
    let sqlGroupBy: string[] = ['posts.id', 'users.username', 'roles.name'];
    let sqlLimit = pageSize + 1;
    let sqlOffset = Number(page) * pageSize;
    if (sqlOffset < 0) {
      sqlOffset = 0;
    }

    if (sortQuery === 'hot') {
      sqlColumns = [
        ...sqlColumns,
        '(COALESCE(log(greatest(abs(sum(vote_value)), 1)) * sign(sum(vote_value)),0) + EXTRACT(EPOCH FROM posts.time_posted)/45000) as hot_score',
      ];
      sqlFrom =
        'posts LEFT JOIN post_votes on (posts.id = post_votes.post_id) LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)';
      sqlGroupBy = ['posts.id', 'users.username', 'roles.name'];
      sqlOrder = ['hot_score DESC'];
    } else if (sortQuery === 'new') {
      sqlOrder = [...sqlOrder, 'posts.time_posted DESC'];
    } else if (sortQuery === 'top-hour') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 hour'"];
    } else if (sortQuery === 'top-day') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 day'"];
    } else if (sortQuery === 'top-week') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 week'"];
    } else if (sortQuery === 'top-month') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
      sqlWhere = [
        ...sqlWhere,
        "posts.time_posted > NOW() - INTERVAL '1 month'",
      ];
    } else if (sortQuery === 'top-year') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 year'"];
    } else if (sortQuery === 'top-all') {
      sqlOrder = [...sqlOrder, 'votes DESC'];
    } else if (sortQuery === undefined) {
      sqlOrder = [...sqlOrder, 'posts.time_posted DESC'];
    } else {
      res.status(400).send({ error: 'Invalid sort parameter' });
      return;
    }

    sqlOrder.push('posts.id DESC');

    if (req.user) {
      if (req.user.role === 'admin' || req.user.role === 'mod') {
        let q = createQuery(
          [
            ...sqlColumns,
            '(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote',
          ],
          sqlFrom,
          {
            groupBy: sqlGroupBy,
            orderBy: [...sqlOrder],
            where: [...sqlWhere, ...(userQuery ? [`users.username = $2`] : [])],
            limit: sqlLimit,
            offset: sqlOffset,
          }
        );
        console.log(q);
        pool
          .query(q, [req.user.username, ...(userQuery ? [userQuery] : [])])
          .then((result) => {
            res.json({rows: result.rows.splice(0, pageSize), next: result.rows.length > 0});
          });
      } else {
        pool
          .query(
            createQuery(
              [
                ...sqlColumns,
                '(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote',
              ],
              sqlFrom,
              {
                groupBy: sqlGroupBy,
                where: [
                  ...sqlWhere,
                  ...(userQuery ? [`users.username = $2`] : []),
                  '(posts.approved = TRUE OR users.username = $1)',
                ],
                orderBy: [...sqlOrder],
                limit: sqlLimit,
                offset: sqlOffset,
              }
            ),
            [req.user.username, ...(userQuery ? [userQuery] : [])]
          )
          .then((result) => {
            res.json({rows: result.rows.splice(0, pageSize), next: result.rows.length > 0});
          });
      }
    } else {
      const q = createQuery(sqlColumns, sqlFrom, {
        where: [
          ...sqlWhere,
          ...(userQuery ? [`users.username = $1`] : []),
          'posts.approved = TRUE',
        ],
        groupBy: sqlGroupBy,
        orderBy: [...sqlOrder],
        limit: sqlLimit,
        offset: sqlOffset,
      });
      pool.query(q, [...(userQuery ? [userQuery] : [])]).then((result) => {
        res.json({rows: result.rows.splice(0, pageSize), next: result.rows.length > 0});
      });
    }
  }
);

router.post('/', (req: Request, res: Response) => {
  const { title, url, body } = req.body;

  if (req.user) {
    if (!title) {
      res.status(400).send({ error: "Field 'title' required" });
      return;
    }

    pool
      .query(
        'INSERT INTO posts (title, url_link, body_text, poster_id, approved) VALUES ($1, $2, $3, (SELECT id FROM users WHERE username = $4), (SELECT role > 1 FROM users WHERE username = $4)) RETURNING id',
        [title, url, body, req.user.username]
      )
      .then((sqlResult) => {
        res.send({
          id: sqlResult.rows[0].id,
        });
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const sqlColumns = [
    'posts.id',
    'posts.title',
    'posts.url_link',
    'posts.time_posted',
    'posts.body_text',
    'users.username',
    'roles.name as role',
    'COALESCE((SELECT sum(post_votes.vote_value) FROM post_votes WHERE post_votes.post_id = posts.id), 0) as votes',
  ];

  if (req.user) {
    if (req.user.role === 'admin' || req.user.role === 'mod') {
      pool
        .query(
          createQuery(
            [
              ...sqlColumns,
              'posts.approved',
              '(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote',
            ],
            'posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)',
            {
              where: ['posts.id = $2'],
            }
          ),
          [req.user.username, id]
        )
        .then((result) => {
          if (result.rows.length === 0) {
            res.sendStatus(404);
          } else {
            res.json({ ...result.rows[0], comments: [] });
          }
        });
    } else {
      pool
        .query(
          createQuery(
            [
              ...sqlColumns,
              '(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote',
            ],
            'posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)',
            {
              where: [
                '(posts.approved = TRUE or users.username = $1) AND posts.id = $2',
              ],
            }
          ),
          [req.user.username, id]
        )
        .then((result) => {
          if (result.rows.length === 0) {
            res.sendStatus(404);
          } else {
            res.json({ ...result.rows[0], comments: [] });
          }
        });
    }
  } else {
    pool
      .query(
        createQuery(
          [...sqlColumns],
          'posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)',
          {
            where: ['posts.approved = TRUE AND posts.id = $1'],
          }
        ),
        [id]
      )
      .then((result) => {
        if (result.rows.length === 0) {
          res.sendStatus(404);
        } else {
          res.json({ ...result.rows[0], comments: [] });
        }
      });
  }
});

router.post('/:id/approve', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user) {
    if (req.user.role === 'admin' || req.user.role === 'mod') {
      pool
        .query('UPDATE posts SET approved = TRUE WHERE id = $1', [id])
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(500);
        });
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(401);
  }
});

router.post('/:id/delete', async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user) {
    if (req.user.role === 'admin' || req.user.role === 'mod') {
      pool
        .query('DELETE FROM posts WHERE id = $1', [id])
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(500);
        });
    } else {
      pool
        .query(
          'DELETE FROM posts WHERE id = $1 AND poster_id = (SELECT id FROM users WHERE username = $2) RETURNING id',
          [id, req.user.username]
        )
        .then((post_id) => {
          if (post_id.rows.length === 0) {
            res.sendStatus(403);
          } else {
            res.sendStatus(200);
          }
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(500);
        });
    }
  } else {
    res.sendStatus(401);
  }
});

router.post('/:id/vote', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { vote } = req.body;

  if (req.user) {
    if (vote !== 0 && vote !== 1 && vote !== -1) {
      res.sendStatus(400);
      return;
    }

    if (vote === 0) {
      pool
        .query(
          'DELETE FROM post_votes WHERE post_id = $1 AND voter_id = (SELECT id FROM users WHERE username = $2)',
          [id, req.user.username]
        )
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(400);
        });
    } else if (vote === 1 || vote === -1) {
      pool
        .query(
          'INSERT INTO post_votes (post_id, voter_id, vote_value) VALUES ($1, (SELECT id FROM users WHERE username = $2), $3) ON CONFLICT (post_id, voter_id) DO UPDATE SET vote_value = $3',
          [id, req.user.username, vote]
        )
        .then(() => {
          res.sendStatus(200);
        })
        .catch((e) => {
          console.log(e);
          res.sendStatus(400);
        });
    }
  } else {
    res.sendStatus(401);
  }
});

router.post('/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { parent_id, body } = req.body;

  if (req.user) {
    if (!body) {
      res.status(400).send({ error: "Field 'body' required" });
      return;
    }

    pool
      .query(
        'INSERT INTO comments (post_id, parent_id, body_text, commenter_id) VALUES ($1, $2, $3, (SELECT id FROM users WHERE username = $4)) RETURNING id',
        [id, parent_id, body, req.user.username]
      )
      .then((sqlResult) => {
        res.send({
          id: sqlResult.rows[0].id,
        });
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(401);
  }
});

router.get('/:id/comments', async (req: Request, res: Response) => {
  const { id } = req.params;

  pool
  .query(
    createQuery(
      ['comments.id', 'comments.body_text', 'comments.time_posted', 'users.username', 'roles.name as role'],
      'comments LEFT JOIN users on (comments.commenter_id = users.id) LEFT JOIN roles on (users.role = roles.id)',
      {
        where: ['comments.post_id = $1'],
        orderBy: ['comments.time_posted DESC'],
      }
    ),
    [id]
  )
  .then((result) => {
    res.json(result.rows);
  }).catch((e) => {
    console.log(e);
    res.sendStatus(500);
  });
});


export default router;
