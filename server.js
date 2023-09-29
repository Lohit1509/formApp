const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');

require('dotenv').config();

const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
});

const app = express();

let initialPath = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(express.static(initialPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(initialPath, "index.html"));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(initialPath, "login.html"));
})

app.get('/register', (req, res) => {
  res.sendFile(path.join(initialPath, "register.html"));
})

app.post('/register-user', (req, res) => {
  const { name, email, password, rank, group_name, OIC_name, OIC_designation } = req.body;

  if (!name || !email || !password || !rank || !group_name || !OIC_name || !OIC_designation) {
    res.json('Please fill in all the fields.');
  } else {
    db('users')
      .insert({
        name: name,
        email: email,
        password: password,
        user_rank: rank,
        group_name: group_name,
        oic_name: OIC_name,
        oic_designation: OIC_designation,
      })
      .then(() => {
        res.json({ name, email });
      })
      .catch((err) => {
        if (err.code === 'ER_DUP_ENTRY') {
          res.json('Email already exists.');
        } else {
          console.error('Error inserting user:', err);
          res.json('An error occurred while registering the user.');
        }
      });
  }
});

app.post('/login-user', (req, res) => {
  const { email, password } = req.body;

  db.select('name', 'email')
    .from('users')
    .where({
      email: email,
      password: password
    })
    .then(data => {
      if (data.length) {
        res.json(data[0]);
      } else {
        res.json('Email or password is incorrect.');
      }
    })
    .catch((err) => {
      console.error('Error querying user:', err);
      res.json('An error occurred while logging in.');
    });
});

app.listen(process.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`);
});
