import express from 'express';
import cors from 'cors';
const router = express.Router();

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}

router.use(cors(corsOptions));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

import getStudentIdFromSession from '../app/User/session.js';
router.get('/sess', async (req, res, next) => {
  let response = await getStudentIdFromSession(req, res);

  res.send(response);
});

export default router;
