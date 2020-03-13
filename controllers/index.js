const express = require('express');
const route=require('../middlewares/routeAuthentication')
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
function index(req, res) {
  res.render('pages/index', { 
    // Available View Template Variables
    userExists: req.user, 
    doNotAllowSignUp: req.flash('doNotAllowSignUp') 
  });
}

function amILoggedIn(req, res) {
  if (req.user) {
    res.json(req.user);
  } else {
    res.send('NOT Logged in!');
  }
}

function getLogout(req, res) {
  req.session.destroy(function (err) {
    res.clearCookie('connect.sid');
    localStorage.removeItem('userToken');
    localStorage.removeItem('loginUser');
    res.redirect('/'); 
  });
}

module.exports = {
  index: index,
  amILoggedIn: amILoggedIn,
  getLogout: getLogout
}
