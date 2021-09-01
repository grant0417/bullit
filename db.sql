CREATE TABLE roles (
  id serial PRIMARY KEY,
  name text UNIQUE
);

INSERT INTO roles (name) VALUES ('user');
INSERT INTO roles (name) VALUES ('approved');
INSERT INTO roles (name) VALUES ('mod');
INSERT INTO roles (name) VALUES ('admin');

CREATE TABLE users (
  id serial PRIMARY KEY,
  username text UNIQUE,
  password_hash text NOT NULL,
  email text,
  description text,
  role int REFERENCES roles (id) DEFAULT 1,
  time_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  graduation_semester text
);

CREATE TABLE posts (
  id serial PRIMARY KEY,
  poster_id int REFERENCES users (id) NOT NULL,
  time_posted timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  title text NOT NULL,
  body_text text,
  url_link text,
  url_site text,
  approved bool DEFAULT FALSE
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  poster_id int REFERENCES users (id) NOT NULL,
  post_id int REFERENCES posts (id) NOT NULL,
  time_posted timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  parent_comment int null REFERENCES comments (id),
  body_text text NOT NULL,
  approved bool
);

CREATE TABLE tags (
  id serial PRIMARY KEY,
  tag_name text UNIQUE NOT NULL,
  creator int REFERENCES users (id) NOT NULL,
  time_created timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  description text,
  approved bool
);

CREATE TABLE post_votes (
  voter_id int REFERENCES users (id) NOT NULL,
  post_id int REFERENCES posts (id) NOT NULL,
  vote_value int NOT NULL,
  time_voted timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (voter_id, post_id)
);

CREATE TABLE comment_votes (
  voter_id int REFERENCES users (id) NOT NULL,
  comment_id int REFERENCES comments (id) NOT NULL,
  vote_value int NOT NULL,
  time_voted timestamp,
  PRIMARY KEY (voter_id, comment_id)
);

CREATE TABLE post_tags (
  post_id int REFERENCES posts (id) NOT NULL,
  tag_id int REFERENCES tags (id) NOT NULL,
  PRIMARY KEY (post_id, tag_id)
);