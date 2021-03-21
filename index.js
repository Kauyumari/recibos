const express = require('express');
const pug = require('pug');
const fs = require('fs');
const { prompt } = require('enquirer');
const nodemailer = require('nodemailer');
const transporter = require('nodemailer-smtp-transport');
require('dotenv').config();

// const app = express();

const templates = require('./templates');
const stylesheets = require('./stylesheet');
// const port = 3005;

const { CLABE, MAIL, PHONE, PWD } = process.env

const readFileText = (filePath) => Object.values(filePath).map((sheet) => {
  try {
    return fs.readFileSync(sheet, 'utf8');
  } catch {
    return null;
  }
}).filter(Boolean);

const smtpTransport = nodemailer.createTransport(transporter({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
      user: MAIL,
      pass: PWD
  }
}))
class Enquirer {
  constructor() {
    this.servicios = [];
    console.log('Bienvenido, agrega un servicio');
    this.recibo = pug.compileFile(templates.reciboBasico);

    this.askForService();
  }

  sendMail(message) {
    var mailOptions = {
      from: MAIL,
      to: this.sendTo, 
      subject: 'Recibo por servicios',
      html: message
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
      if (error){
        throw new Error(error);
      }
      console.log(response);
    });
  }

  assembleMail() {
    const [sheets] = [stylesheets].map(readFileText);
    const html = this.recibo({
      stylesheets: sheets,
      services: this.servicios,
      total: this.servicios.reduce((acc, curr) => Number(curr.cost) + acc, 0),
      clabe: CLABE,
      mail: MAIL,
      tel: PHONE
    });

    
    this.sendMail(html)
  }

  async askIfOk() {
    console.log(this.sendTo, this.servicios);
    const isOk = await prompt({
      type: 'confirm',
      name: 'isCorrect',
      message: 'Los datos son correctos?'
    })

    if(!isOk.isCorrect) {
      return new Enquirer();
    }

    return this.assembleMail();
  }

  async askForEmail() {
    const data = await prompt({
      type: 'input',
      name: 'email',
      message: 'A que email vamos a enviarlo?'
    })

    this.sendTo = data.email;
    this.askIfOk();
  }

  async askForService() {
    const response = await prompt([
      {
        type: 'input',
        name: 'service',
        message: 'Cual es el concepto?'
      },
      {
        type: 'input',
        name: 'cost',
        message: 'Cual es el precio?'
      },
    ]);
    this.servicios.push(response);

    const question = await prompt({
      type: 'confirm',
      name: 'confirm',
      message: 'Deseas añadir otro servicio?'
    });

    if(question.confirm) return this.askForService();
    return this.askForEmail();
  }
}

new Enquirer();