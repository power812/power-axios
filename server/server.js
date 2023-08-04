import express from 'express';
const app = express();
import bodyParser from 'body-parser';
const router = express.Router();

// 使用body-parser中间件
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

router.get('/api', function (req, res) {
  res.json({
    param: req.query,
    msg: '请求成功',
  });
});
router.post('/api', function (req, res) {
  res.json({
    data: req.body,
    msg: '请求成功',
  });
});

app.use(router);

const port = process.env.PORT || 3000;
const lister = app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}, Ctrl+C to stop`);
});
export default lister;
