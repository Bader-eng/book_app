DROP TABLE IF EXISTS tasks;
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  image VARCHAR(255),
  title VARCHAR(255),
  author VARCHAR(255),
  description TEXT
);