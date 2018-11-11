import fs from "fs";
import path from "path";
const WORKSPACE_DIR = "/opt/Worckspace/MyS3";
class Filesystem {
    constructor() {
        if (!Filesystem.instance) {
            this.initialize();
        }
    }
    initialize() {}
    removeBlob(user, bucketName, blobName) {
        try {
            let tmpPathFile = path.join(WORKSPACE_DIR, user, bucketName, blobName);

            if (fs.existsSync(tmpPathFile)) {
                fs.unlinkSync(tmpPathFile);
            }
        } catch (err) {
            console.log(err);
        }
    }
}
const instance = new Filesystem();
Object.freeze(instance);
export default instance;