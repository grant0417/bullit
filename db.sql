CREATE TABLE roles (
  id serial PRIMARY KEY,
  name text UNIQUE
);

INSERT INTO roles (name) VALUES ('Admin');
INSERT INTO roles (name) VALUES ('Approved User');
INSERT INTO roles (name) VALUES ('User');

CREATE TABLE users (
  id serial PRIMARY KEY,
  name text UNIQUE,
  password_hash text NOT NULL,
  description text,
  role int REFERENCES roles (id),
  time_created timestamp
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  poster_id int REFERENCES users (id),
  time_posted timestamp,
  title text NOT NULL,
  self_text text,
  url_link text,
  approved bool
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  poster_id int REFERENCES users (id),
  post_id int REFERENCES posts (id),
  parent_comment int null REFERENCES comments (id),
  approved bool
);
