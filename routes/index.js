import { Router } from 'express';
import passport from 'passport'
import users from './user';
import buckets from './bucket'
import blobs from './blob'
import auth from './auth';

const api = Router();

api.get('/', (req, res) => {
    res.json({ hello: 'express.island' });
});

api.use('/users', passport.authenticate('jwt', { session : false }), users);
api.use('/users/:uuid/buckets', buckets);
api.use('/users/:uuid/buckets/:b_id/blob', blobs);
api.use('/auth', auth);

export default api;