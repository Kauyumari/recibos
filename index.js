const express = require('express');
const pug = require('pug');
const fs = require('fs');

const app = express();

const templates = require('./templates');
const stylesheets = require('./stylesheet');
const port = 3005;


app.get('/', (req, res) => {
  const recibo = pug.compileFile(templates.reciboBasico)
  const sheets = Object.values(stylesheets).map((sheet) => {
    try {
      return fs.readFileSync(sheet, 'utf8');
    } catch {
      return null
    }
  }).filter(Boolean);

  const html = recibo({
    stylesheets: sheets
  });
  res.send(html);
})

app.listen(port, () => {
  console.log('Server listening on port http://localhost:' + port)
})