const express = require('express');
const passport = require('passport');

var jwt = require('jsonwebtoken');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}
function checkLoginUser(req,res,next){
  var userToken=localStorage.getItem('userToken');
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch(err) {
    res.redirect('/');
  }
  next();
}
const Guest = require('../../models/guest');

// Guest Index (Dashboard) Controller
function index(req, res) {
  var getUserID=req.user.id;
  var token = jwt.sign({ userID: getUserID }, 'loginToken');//generate tokens
  localStorage.setItem('userToken', token);//store the token in local storage
  res.render('pages/guest/dashboard', { 
    guestSignupMessage: req.flash('guestSignupSuccessMessage'),
    guestEmail: req.user.localStrategy.email,
    guestFirstName: req.user.firstName,
    guestLastName: req.user.lastName,
    guestroll: req.user.roll,
    guestcontact: req.user.contact,
    guestbranch: req.user.branch,
    guestyear:req.user.year,
    guestskills:req.user.skills,
    guestgithub:req.user.github,
    guestcompany:req.user.company,
    guestimage:req.user.image,
    id:req.user.id,
  });
}

// GET Guest Registration Page
function getSignup(req, res) {
  res.render('pages/guest/signup', { 
    guestSignupMessage: req.flash('guestSignupFailureMessage'),
  });
}

// Handle Guest Registration POST Request
function postSignup(req, res, next) {
 
  passport.authenticate('local-guest-signup', {
    successRedirect : '/guest/',
    failureRedirect : '/guest/signup',
    failureFlash : true
  })(req, res, next) // immediately invoke passport.authenticate
  
}

// GET Guest Login Page
function getLogin(req, res) {
  res.render('pages/guest/login', { 
    noGuestEmailFoundOnLogin: req.flash('noGuestEmailFoundOnLogin'),
    incorrectGuestPassword: req.flash('incorrectGuestPassword')
  });
}

// Handle Guest Login POST Request
function postLogin(req, res, next) {
  
  passport.authenticate('local-guest-login', {
    successRedirect: '/guest/',
    failureRedirect: '/guest/login',
    failureFlash: true
  })(req, res, next);
  
}

function getUser(req, res) {
  res.send(req.user);
}

// Export Guest Controllers
module.exports = {
  index: index,
  getSignup: getSignup,
  postSignup: postSignup,
  getLogin: getLogin,
  postLogin: postLogin,
  getUser: getUser,
}
