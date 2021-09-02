import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";
import { Pool, Client } from "pg";
import argon2 from "argon2";
import cookieParser from "cookie-parser";

async function createJwt(username: string, role: string): Promise<string> {
  const privKey = await fs.promises.readFile("./private.pem", "utf8");
  return jwt.sign({ username, role }, privKey, {
    expiresIn: "30d",
    algorithm: "RS256",
  });
}

async function verifyJwt(token: string): Promise<any> {
  const pubKey = await fs.promises.readFile("./public.pem", "utf8");
  return jwt.verify(token, pubKey);
}

function createQuery(
  columns: string[],
  table: string,
  {
    where,
    groupBy,
    orderBy,
  }: { where?: string[]; groupBy?: string[]; orderBy?: string[] } = {}
) {
  let query = `SELECT ${columns.join(", ")} FROM ${table}`;
  if (where && where.length > 0) {
    query += ` WHERE ${where.map((w) => `(${w})`).join(" AND ")}`;
  }
  if (groupBy && groupBy.length > 0) {
    query += ` GROUP BY ${groupBy.join(", ")}`;
  }
  if (orderBy && orderBy.length > 0) {
    query += ` ORDER BY ${orderBy.join(", ")}`;
  }
  return query;
}

async function startApp(port: number) {
  const pool = new Pool();
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.get("/api/posts", async (req, res) => {
    const { user, sort } = req.query;

    let sqlColumns = [
      "posts.id",
      "posts.title",
      "posts.url_link",
      "posts.time_posted",
      "users.username",
      "roles.name as role",
      "posts.approved",
      "COALESCE((SELECT sum(post_votes.vote_value) FROM post_votes WHERE post_votes.post_id = posts.id), 0) as votes",
    ];

    let sqlFrom =
      "posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)";

    let sqlOrder = [];
    let sqlWhere = [];
    let sqlGroupBy = [];

    if (sort === "hot") {
      sqlColumns = [
        ...sqlColumns,
        "(COALESCE(log(greatest(abs(sum(vote_value)), 1)) * sign(sum(vote_value)),0) + EXTRACT(EPOCH FROM posts.time_posted)/45000) as hot_score",
      ];
      sqlFrom =
        "posts LEFT JOIN post_votes on (posts.id = post_votes.post_id) LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)";
      sqlGroupBy = ["posts.id", "users.username", "roles.name"];
      sqlOrder = ["hot_score DESC"];
    } else if (sort === "new") {
      sqlOrder = [...sqlOrder, "posts.time_posted DESC"];
    } else if (sort === "top-hour") {
      sqlOrder = [...sqlOrder, "votes DESC"];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 hour'"];
    } else if (sort === "top-day") {
      sqlOrder = [...sqlOrder, "votes DESC"];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 day'"];
    } else if (sort === "top-week") {
      sqlOrder = [...sqlOrder, "votes DESC"];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 week'"];
    } else if (sort === "top-month") {
      sqlOrder = [...sqlOrder, "votes DESC"];
      sqlWhere = [
        ...sqlWhere,
        "posts.time_posted > NOW() - INTERVAL '1 month'",
      ];
    } else if (sort === "top-year") {
      sqlOrder = [...sqlOrder, "votes DESC"];
      sqlWhere = [...sqlWhere, "posts.time_posted > NOW() - INTERVAL '1 year'"];
    } else if (sort === "top-all") {
      sqlOrder = [...sqlOrder, "votes DESC"];
    } else if (sort === undefined) {
      sqlOrder = [...sqlOrder, "posts.time_posted DESC"];
    } else {
      res.status(400).send({ error: "Invalid sort parameter" });
      return;
    }

    sqlOrder.push("posts.id DESC");

    if (req.cookies.token) {
      verifyJwt(req.cookies.token)
        .then((decoded) => {
          if (decoded.role === "admin" || decoded.role === "mod") {
            let q = createQuery(
              [
                ...sqlColumns,
                "(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote",
              ],
              sqlFrom,
              {
                groupBy: sqlGroupBy,
                orderBy: [...sqlOrder],
                where: [
                  ...sqlWhere,
                  ...(user ? [`users.username = '${user}'`] : []),
                ],
              }
            );
            console.log(q);
            pool.query(q, [decoded.username]).then((result) => {
              res.json(result.rows);
            });
          } else {
            pool
              .query(
                createQuery(
                  [
                    ...sqlColumns,
                    "(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote",
                  ],
                  sqlFrom,
                  {
                    groupBy: sqlGroupBy,
                    where: [
                      ...sqlWhere,
                      ...(user ? [`users.username = '${user}'`] : []),
                      "(posts.approved = TRUE OR users.username = $1)",
                    ],
                    orderBy: [...sqlOrder],
                  }
                ),
                [decoded.username]
              )
              .then((result) => {
                res.json(result.rows);
              });
          }
        })
        .catch((err) => {});
    } else {
      const q = createQuery(sqlColumns, sqlFrom, {
        where: [
          ...sqlWhere,
          ...(user ? [`users.username = '${user}'`] : []),
          "posts.approved = TRUE",
        ],
        groupBy: sqlGroupBy,
        orderBy: [...sqlOrder],
      });
      pool.query(q).then((result) => {
        res.json(result.rows);
      });
    }

    // res.send([
    //   {
    //     title: "Hello World",
    //     url: "https://www.google.com",
    //     votes: 10,
    //     id: "abc123",
    //     username: "JohnJ",
    //     verifiedUser: true,
    //     times\tamp: "2021-08-12",
    //   },
    //   {
    //     title: "Goodbye World",
    //     url: "https://www.reddit.com/",
    //     votes: 1,
    //     id: "xyz123",
    //     username: "steve",
    //     verifiedUser: false,
    //     timestamp: "2021-08-15",
    //   },
    //   {
    //     title: "Hello World2",
    //     votes: 100,
    //     id: "abc1234",
    //     username: "JohnJ",
    //     verifiedUser: true,
    //     timestamp: "2021-08-30",
    //   },
    // ]);
  });

  app.get("/api/posts/:id", (req, res) => {
    const { id } = req.params;

    const sqlColumns = [
      "posts.id",
      "posts.title",
      "posts.url_link",
      "posts.time_posted",
      "posts.body_text",
      "users.username",
      "roles.name as role",
      "COALESCE((SELECT sum(post_votes.vote_value) FROM post_votes WHERE post_votes.post_id = posts.id), 0) as votes",
    ];

    if (req.cookies.token) {
      verifyJwt(req.cookies.token)
        .then((decoded) => {
          if (decoded.role === "admin" || decoded.role === "mod") {
            pool
              .query(
                createQuery(
                  [
                    ...sqlColumns,
                    "posts.approved",
                    "(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote",
                  ],
                  "posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)",
                  {
                    where: ["posts.id = $2"],
                  }
                ),
                [decoded.username, id]
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
                    "(SELECT vote_value FROM post_votes WHERE post_id = posts.id AND voter_id = (SELECT id FROM users WHERE username = $1)) as current_vote",
                  ],
                  "posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)",
                  {
                    where: [
                      "(posts.approved = TRUE or users.username = $1) AND posts.id = $2",
                    ],
                  }
                ),
                [decoded.username, id]
              )
              .then((result) => {
                if (result.rows.length === 0) {
                  res.sendStatus(404);
                } else {
                  res.json({ ...result.rows[0], comments: [] });
                }
              });
          }
        })
        .catch((err) => {});
    } else {
      pool
        .query(
          createQuery(
            [...sqlColumns],
            "posts LEFT JOIN users on (posts.poster_id = users.id) LEFT JOIN roles on (users.role = roles.id)",
            {
              where: ["posts.approved = TRUE AND posts.id = $1"],
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

    // pool
    //   .query(
    //     "SELECT posts.id, posts.title, posts.url_link, posts.time_posted, users.username, 0 as votes FROM posts LEFT JOIN users on (posts.poster_id = users.id) WHERE posts.approved = TRUE AND posts.id = $1",
    //     [id]
    //   )
    //   .then((result) => {
    //     res.json({
    //       ...result.rows[0],
    //       comments: [
    //         {
    //           body: `A paragraph with *emphasis* and **strong importance**.`,
    //           username: "bob",
    //           timestamp: "2021-08-12",
    //         },
    //         {
    //           body: "Just a link: https://reactjs.com.",
    //           username: "john",
    //           timestamp: "2021-08-12",
    //         },
    //       ],
    //     });
    //   });

    // res.send({
    //   title: "Hello World",
    //   votes: 10,
    //   id: "abc123",
    //   username: "john",
    //   timestamp: "2021-08-12",
    //   body: "# Body",
    //   comments: [
    //   ],
    // });
  });

  app.get("/api/users/:name", async (req, res) => {
    const user = await pool.query(
      createQuery(
        [
          "users.username",
          "users.description",
          "users.time_created",
          "users.graduation_semester",
          "roles.name as role",
        ],
        "users LEFT JOIN roles on (users.role = roles.id)",
        {
          where: ["users.username = $1"],
        }
      ),
      [req.params.name]
    );

    if (user.rows.length === 0) {
      res.status(404).send({ error: "User not found" });
      return;
    }

    res.send({ ...user.rows[0], posts: [] });

    // res.send({
    //   name: "JohnJ",
    //   verified: true,
    //   description: "I am a user",
    //   graduationSemester: "Fall 2020",
    //   joined: "2021-08-12",
    //   posts: [
    //     {
    //       title: "Hello World",
    //       url: "https://www.google.com",
    //       votes: 10,
    //       id: "abc123",
    //       username: "JohnJ",
    //       verifiedUser: true,
    //       timestamp: "2021-08-12",
    //     },
    //   ]
    // });
  });

  app.post("/api/create-user", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send({ error: "'username' and 'password' required" });
      return;
    }

    pool
      .connect()
      .then(async (client) => {
        if (
          (
            await client.query("SELECT 1 FROM users WHERE username = $1", [
              username,
            ])
          ).rowCount > 0
        ) {
          res.status(400).send({ error: "Username already exists" });
          return;
        }

        if (password.length < 8) {
          res
            .status(400)
            .send({ error: "Password must be at least 8 characters" });
          return;
        }

        const hash = await argon2.hash(password);

        await client.query(
          "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
          [username, hash]
        );
        client.release();

        const token = await createJwt(username, "user");

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
          // secure: true,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000),
        });
        res.cookie("username", username, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000),
        });
        res.send({ username, role: "user" });
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).send({ error: "'username' and 'password' required" });
      return;
    }

    pool
      .connect()
      .then(async (client) => {
        const sqlResult = await client.query(
          "SELECT users.password_hash, roles.name as role FROM users LEFT JOIN roles on (users.role = roles.id) WHERE users.username = $1",
          [username]
        );
        client.release();

        if (sqlResult.rowCount === 0) {
          res.status(400).send({ error: "Username does not exist" });
          return;
        }

        const match = await argon2.verify(
          sqlResult.rows[0].password_hash,
          password
        );

        if (!match) {
          res.status(400).send({ error: "Incorrect password" });
          return;
        }

        const token = await createJwt(username, sqlResult.rows[0].role);

        res.cookie("token", token, {
          httpOnly: true,
          sameSite: "strict",
          // secure: true,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000),
        });
        res.cookie("username", username, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000),
        });
        res.send({ username, role: sqlResult.rows[0].role });
      })
      .catch((e) => {
        console.log(e);
        res.sendStatus(500);
      });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.clearCookie("username");
    res.send();
  });

  app.post("/api/posts", (req, res) => {
    const { title, url, body } = req.body;

    if (!title) {
      res.status(400).send({ error: "Field 'title' required" });
      return;
    }

    if (!req.cookies?.token) {
      res.status(401).send({ error: "Not logged in" });
      console.log("Not logged in");
      return;
    }

    verifyJwt(req.cookies.token)
      .then(async (decoded) => {
        pool
          .query(
            "INSERT INTO posts (title, url_link, body_text, poster_id, approved) VALUES ($1, $2, $3, (SELECT id FROM users WHERE username = $4), (SELECT role > 1 FROM users WHERE username = $4)) RETURNING id",
            [title, url, body, decoded.username]
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
      })
      .catch((e) => {
        res.status(401).send({ error: "Invalid JWT" });
      });

    // pool.connect().then(async (client: Client) => {
    //   req.cookies.token
    // });
    // res.sendStatus(200);
  });

  app.post("/api/posts/:id/approve", async (req, res) => {
    const { id } = req.params;

    if (!req.cookies?.token) {
      res.sendStatus(401);
      return;
    } else {
      verifyJwt(req.cookies.token).then(async (decoded) => {
        if (decoded.role === "admin" || decoded.role === "mod") {
          pool
            .query("UPDATE posts SET approved = TRUE WHERE id = $1", [id])
            .then(() => {
              res.sendStatus(200);
            })
            .catch((e) => {
              console.log(e);
              res.sendStatus(500);
            });
        } else {
          res.sendStatus(403);
          return;
        }
      });
    }
  });

  app.post("/api/posts/:id/delete", async (req, res) => {
    const { id } = req.params;

    if (!req.cookies?.token) {
      res.sendStatus(401);
      return;
    } else {
      verifyJwt(req.cookies.token).then(async (decoded) => {
        if (decoded.role === "admin" || decoded.role === "mod") {
          pool
            .query("DELETE FROM posts WHERE id = $1", [id])
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
              "DELETE FROM posts WHERE id = $1 AND poster_id = (SELECT id FROM users WHERE username = $2) RETURNING id",
              [id, decoded.username]
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
          return;
        }
      });
    }
  });

  app.post("/api/posts/:id/vote", async (req, res) => {
    const { id } = req.params;
    const { vote } = req.body;

    if (!req.cookies?.token) {
      res.sendStatus(401);
      return;
    }

    if (vote !== 0 && vote !== 1 && vote !== -1) {
      res.sendStatus(400);
      return;
    }

    verifyJwt(req.cookies.token).then(async (decoded) => {
      if (vote === 0) {
        pool
          .query(
            "DELETE FROM post_votes WHERE post_id = $1 AND voter_id = (SELECT id FROM users WHERE username = $2)",
            [id, decoded.username]
          )
          .then(() => {
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });
      } else if (vote === 1 || vote === -1) {
        pool
          .query(
            "INSERT INTO post_votes (post_id, voter_id, vote_value) VALUES ($1, (SELECT id FROM users WHERE username = $2), $3) ON CONFLICT (post_id, voter_id) DO UPDATE SET vote_value = $3",
            [id, decoded.username, vote]
          )
          .then(() => {
            res.sendStatus(200);
          })
          .catch((e) => {
            console.log(e);
            res.sendStatus(500);
          });
      }
    });
  });

  app.listen(port, () => {
    console.log("server is up on port: " + port);
  });
}

require("dotenv").config();
startApp(8800).catch(console.log);
