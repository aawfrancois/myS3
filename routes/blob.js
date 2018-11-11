import {Router} from "express";
import Blob from "../models/blob";
import Bucket from "../models/bucket";
import multer from "multer";
import path from "path";
import filesystem from "../lib/filesystem";

const WORKSPACE_DIR = "/opt/Workspace/MyS3";

const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        let {uuid, b_id} = req.params;
        const bucket = await Bucket.findOne({
            attributes: ["name"],
            where: {b_id, user_uuid: uuid}
        });
        await cb(null, path.join(WORKSPACE_DIR, uuid, bucket.name));
    },
    filename: async (req, file, cb) => {
        await cb(null, new Date().toISOString() + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    }
});

const api = Router({mergeParams: true});

api.post("/", upload.single("blob"), async (req, res) => {
    try {
        let name = req.file.filename;
        let path = req.file.path;
        let size = req.file.size;
        let b_id = req.params.b_id;
        const blob = new Blob({name, path, size, bucket_id: b_id});
        if (req.file) {
            await blob.save();
            res.status(201).json({blob: {blob}});
        }
    } catch (err) {
        res.status(400).json({err: err.message});
    }
});

api.delete("/:id", async (req, res) => {
    try {
        const {uuid, b_id, id} = req.params;
        const bucket = await Bucket.findOne({
            attributes: ["name"],
            where: {id, user_uuid: uuid}
        });
        const blob = await Blob.findOne({
            attributes: ["name"],
            where: {
                id: id,
                bucket_id: b_id
            }
        });
        if (blob) {
            filesystem.removeBlob(uuid, bucket.name, blob.name);
            await Blob.destroy({where: {id: id}});
            res.status(204).end();
        } else {
            res.status(400).json({message: "blob doesn't exist"});
        }
    } catch (err) {
        res.status(400).json({err});
    }
});

api.put("/:id", async (req, res) => {
    const {b_id, id} = req.params;
    try {
        const blob = await Blob.findOne({
            attributes: ["name", "id"],
            where: {
                id: id,
                bucket_id: b_id
            }
        });

        if (blob) {
            if (req.body.name !== "") {
                let nameFile = req.body.name + path.extname(blob.name);
                await blob.update({name: nameFile});
                res.status(204).send();
            } else {
                await blob.update({name: blob.name});
                res.status(204).send();
            }
        }
    } catch (err) {
        res.status(400).json({err: err.message});
    }
});

api.get("/:id", async (req, res) => {
    const {b_id, id} = req.params;
    try {
        const blob = await Blob.findOne({
            attributes: ["name", "id"],
            where: {
                id: id,
                bucket_id: b_id
            }
        });
        res.status(200).json({blob});
    } catch (err) {
        res.status(400).json({err: `could not connect to database, err: ${err.message}`});
    }

});
export default api;
