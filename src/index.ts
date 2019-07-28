import app from './App'

const port = process.env.PORT || 5000;

app.listen(port, (err) => {
  if (err) {
    return console.log(err);
  }

  return console.log(`Server started on port ${port}`);
})