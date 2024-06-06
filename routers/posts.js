const express = require("express");
const postController = require('../controllers/posts');
const router = express.Router();

router.get('/', postController.index);

router.post('/', postController.create);

router.get('/:slug', postController.show);

router.put('/:slug', postController.update);

router.delete('/:slug', postController.destroy);


module.exports = router;