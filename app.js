const express = require('express');    
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 5000;

// Serve static files (for CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/testdb')
  .then(() => {
    console.log('MongoDB is connected');
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
  });

// Registration Schema
const registrationSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  password: String
});

const Registration = mongoose.model('Registration', registrationSchema);

// POST route for registration
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  const newRegistration = new Registration({
    fullName: name,
    email,
    password
  });

  newRegistration.save()
    .then(() => {
      res.redirect('/login.html?message=registered');
    })
    .catch(err => {
      res.status(500).send(`Error saving registration: ${err}`);
    });
});

// POST route for login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Registration.findOne({ email });

    if (user && user.password === password) {
      // ✅ Redirect to homepage with name and email in query
      res.redirect(`/index.html?name=${encodeURIComponent(user.fullName)}&email=${encodeURIComponent(user.email)}`);
    } else {
      res.redirect('/login.html?message=error');
    }
  } catch (error) {
    res.status(400).send('Error: ' + error.message);
  }
});

// Serve homepage
app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Optional: serve profile.html if needed
app.get('/profile.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
