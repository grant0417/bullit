import express from "express";
import jwt from "jsonwebtoken";
import fs from "fs";

async function startApp(port: number) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/api/posts", (_, res) => {
    res.send([
      {
        title: "Hello World",
        url: "https://www.google.com",
        votes: 10,
        id: "abc123",
        username: "JohnJ",
        verifiedUser: true,
        timestamp: "2021-08-12",
      },
      {
        title: "Goodbye World",
        url: "https://www.reddit.com/",
        votes: 1,
        id: "xyz123",
        username: "steve",
        verifiedUser: false,
        timestamp: "2021-08-15",
      },
      {
        title: "Hello World2",
        votes: 100,
        id: "abc1234",
        username: "JohnJ",
        verifiedUser: true,
        timestamp: "2021-08-30",
      },
    ]);
  });

  app.get("/api/posts/:id", (_, res) => {
    res.send({
      title: "Hello World",
      votes: 10,
      id: "abc123",
      username: "john",
      timestamp: "2021-08-12",
      body: "# Body",
      comments: [
        {
          body: `A paragraph with *emphasis* and **strong importance**.`,
          username: "bob",
          timestamp: "2021-08-12",
        },
        {
          body: "Just a link: https://reactjs.com.",
          username: "john",
          timestamp: "2021-08-12",
        },
      ],
    });
  });

  app.get("/api/users/:name", (_, res) => {
    res.send({
      name: "JohnJ",
      verified: true,
      description: "I am a user",
      graduationSemester: "Fall 2020",
      joined: "2021-08-12",
      posts: [
        {
          title: "Hello World",
          url: "https://www.google.com",
          votes: 10,
          id: "abc123",
          username: "JohnJ",
          verifiedUser: true,
          timestamp: "2021-08-12",
        },
      ]
    });
  });

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (username === "john" && password === "secret") {
      fs.readFile("./private.pem", (err, privKey) => {
        if (err) {
          console.log(err);
          res.status(500).send("Internal Server Error");
        } else {
          const token = jwt.sign({ username }, privKey, { expiresIn: "30d" });

          res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000 - 30000),
          });
          res.send();
        }
      });
    } else {
      res.status(401).send({
        error: "invalid credentials",
      });
    }
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.send();
  });

  app.listen(port, () => {
    console.log("server is up on port: " + port);
  });
}

require("dotenv").config();
startApp(8800).catch(console.log);
