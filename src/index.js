'use strict';

const {OK, CREATED, SERVICE_UNAVAILABLE, NOT_IMPLEMENTED, NO_CONTENT, NOT_FOUND} = require('http-status-codes');
const express = require('express');
const config = require('./config.js');
const Datastore = require('nedb-async-await').Datastore;
const path = require('path');
const createS3 = require('./s3');

const users = Datastore({ filename: path.join('db', 'users.db'), autoload: true });

const app = express();
app.use(express.json());

const ip = config.get('ip');
const port = config.get('port');
const s3Client = createS3();
const file = 'object.txt';

app.get('/', (req, res) => {
    res.statusCode = NOT_IMPLEMENTED;
    res.send('work in progress');
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
        console.log('post');
        try {
            const user = await users.insert(req.body);
            res.statusCode = CREATED;
            s3Client.putObject(file);
            res.send(user._id);
        } catch (e) {
            res.statusCode = SERVICE_UNAVAILABLE;
            res.send(e);
        }
    });

app.delete('/users/:userId', async (req, res) => {
    try {
        res.statusCode = await users.remove({_id: req.params.userId}) === 1 ? NO_CONTENT : NOT_FOUND;
        res.send('');
    } catch (e) {
        res.statusCode = SERVICE_UNAVAILABLE;
        res.send(e);
    }
});

app.listen(port, ip, () => console.log(`running on http://${ip}:${port}!`));
