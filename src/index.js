'use strict';

const {OK, CREATED, SERVICE_UNAVAILABLE, NOT_IMPLEMENTED, NO_CONTENT, NOT_FOUND} = require('http-status-codes');
const express = require('express');
const config = require('./config.js');
const Datastore = require('nedb-async-await').Datastore;
const path = require('path');
const createS3 = require('./s3');
const fileUpload = require('express-fileupload');

const users = Datastore({filename: path.join('db', 'users.db'), autoload: true});

const app = express();
app.use(express.json({type: 'application/*+json'}));
app.use(fileUpload({limits: {fileSize: 1 * 1024 * 1024}}));

const ip = config.get('ip');
const port = config.get('port');
const s3Client = createS3('my-bucket-service-ex.2');

app.get('/', (req, res) => {
  res.statusCode = OK;
  res.send({});
});

app.get('/health', (req, res) => {
  res.statusCode = OK;
  res.send({});
});

app.route('/users')
  .get(async (req, res) => {
    let response;
    try {
      res.statusCode = OK;
      response = await users.find({});
    } catch (e) {
      response = e;
      res.statusCode = SERVICE_UNAVAILABLE;
    }
    return res.send(response);
  })
  .post(async (req, res) => {
    try {
      let entry = {...req.body};
      if (req.files) {
        await s3Client.putObject(req.files.file.data, req.files.file.name);
        entry.avatar = req.files.file.name;
      }
      const user = await users.insert(entry);
      res.statusCode = CREATED;
      res.send(user._id);
    } catch (e) {
      res.statusCode = SERVICE_UNAVAILABLE;
      res.send(e);
    }
  });

app.route('/users/:userId')
  .get(async (req, res) => {
    const user = await users.findOne({_id: req.params.userId});
    let img;
    if (user.avatar) {
      img = await s3Client.getUrl(user.avatar);
    }
    user.img = img;
    res.send(user);
  })
  .delete(async (req, res) => {
    try {
      res.statusCode = await users.remove({_id: req.params.userId}) === 1 ? NO_CONTENT : NOT_FOUND;
      res.send('');
    } catch (e) {
      res.statusCode = SERVICE_UNAVAILABLE;
      res.send(e);
    }
  });

app.listen(port, ip, () => console.log(`running on http://${ip}:${port}!`));
