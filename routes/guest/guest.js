const express = require('express');
const router  = express.Router();
var multer = require('multer');
// All request callbacks are handled in this controller file
const guestController = require('../../controllers/guest/guest');

// Route Protection and Authentication
const ensureUser = require('../../middlewares/routeAuthentication');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './public/uploads')
    },
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now())
    }
  });
  var upload = multer({storage: storage}).single('file');
// Public Guest Routes:
router.get('/signup', ensureUser.isNotLoggedIn, guestController.getSignup);
router.post('/signup',upload, ensureUser.isNotLoggedIn, guestController.postSignup);
router.get('/login', ensureUser.isNotLoggedIn, guestController.getLogin);
router.post('/login', ensureUser.isNotLoggedIn, guestController.postLogin);

// Protected Guest Routes:
router.get('/', ensureUser.isGuest, guestController.index);
router.get('/user', ensureUser.isGuest, guestController.getUser);

module.exports = router;
