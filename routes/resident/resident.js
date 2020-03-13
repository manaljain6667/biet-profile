const express = require('express');
const router  = express.Router();
var multer = require('multer');
// All request callbacks are handled in this controller file
const residentController = require('../../controllers/resident/resident');

// Route Protection
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

// Public Resident Routes
router.get('/signup', ensureUser.isNotLoggedIn, residentController.getSignup);
router.post('/signup',upload, ensureUser.isNotLoggedIn, residentController.postSignup);
router.get('/login', ensureUser.isNotLoggedIn, residentController.getLogin);
router.post('/login', ensureUser.isNotLoggedIn, residentController.postLogin);

router.get('/', ensureUser.isResident, residentController.index);
router.get('/user', ensureUser.isResident, residentController.getUser);

module.exports = router;
// ../../views/pages