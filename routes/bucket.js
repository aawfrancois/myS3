import {Router} from 'express';
import fs from 'fs';
import Bucket from "../models/bucket";
import {pick} from "lodash";
import path from 'path'

let api = Router({mergeParams: true});

api.get('/:b_id', async (req, res) => {
    try {
        const bucker = await Bucket.findOne({where: {id: req.params.b_id}});
        res.status(200).json({bucker});
    } catch (err) {
        res.status(400).json({err: `could not connect to database, err: ${err.message}`});
    }
});

api.put('/:b_id', async (req, res) => {
    try {
        const bucket = await Bucket.findOne({where: {id: req.params.b_id}})
        const {uuid} = req.user.dataValues;

        let bucketPath = path.join(WORKSPACE_DIR, uuid, bucket.name);
        if (fs.existsSync(bucketPath)) {
            let newBucketPath = path.join(WORKSPACE_DIR, uuid, req.body.name);
            fs.rename(bucketPath, newBucketPath);
        }
        await bucket.update({name: req.body.name})

        res.status(200);
    } catch (err) {
        res.status(400).json({err: err.message})
    }
})

api.delete('/:b_id', async (req, res) => {
    try {
        const bucket = await Bucket.destroy({where: {id: req.params.b_id}});
        const {uuid} = req.user.dataValues;
        let bucketPath = path.join(WORKSPACE_DIR, uuid, bucket.name);
        if (fs.existsSync(bucketPath)) {
            fs.rmdirSync(bucketPath);
        }
        res.status(200).json({bucket});
    } catch (err) {
        res.status(400).json({err: `bucket doesn't exist, err: ${err.message}`});
    }
})

api.post('/', async (req, res) => {
    try {
        const {uuid} = req.user.dataValues
        const {name} = req.body

        const bucket = new Bucket({name, user_uuid: uuid})

        const BASE_URL = '/opt/workspace/myS3/';

        if (!fs.existsSync(BASE_URL)) {
            fs.mkdirSync(BASE_URL);
        }

        if (!fs.existsSync(path.join(BASE_URL, uuid))) {
            let folderUser = path.join(BASE_URL, uuid);

            fs.mkdirSync(folderUser);
        }

        if (!fs.existsSync(path.join(BASE_URL, uuid, name))) {
            let bucketUser = path.join(BASE_URL, uuid, name)
            fs.mkdirSync(bucketUser);
        }

        await bucket.save();

        res.status(201).json(bucket)
    } catch (err) {
        res.status(400).json({err: err.message})
    }
})

export default api;