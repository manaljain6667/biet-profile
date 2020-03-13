const express = require('express');
const passport = require('passport');
const Resident = require('../../models/resident');
const MongoClient=require('../../config/keys').mongoURI;

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
// Resident Index (Dashboard) Controller
function index(req, res) {
  var getUserID=req.user.id;
  var token = jwt.sign({ userID: getUserID }, 'loginToken');//generate tokens
  localStorage.setItem('userToken', token);//store the token in local storage

  res.render('pages/resident/dashboard', { 
    residentSignupMessage: req.flash('residentSignupSuccessMessage'),
    residentEmail: req.user.localStrategy.email,
    residentFirstName: req.user.firstName,
    residentLastName: req.user.lastName,
    residentroll: req.user.roll,
    residentcontact: req.user.contact,
    residentbranch: req.user.branch,
    residentyear:req.user.year,
    residentskills:req.user.skills,
    residentgithub:req.user.github,
    residentimage:req.user.image,
    id:req.user.id,
  });
  
}

// GET Resident Registration Page
function getSignup(req, res) {
  res.render('pages/resident/signup', {
    residentSignupMessage: req.flash('residentSignupFailureMessage'),
  });
}
// function getupdate(req, res) {
//   res.render('pages/resident/', {
//     residentSignupMessage: req.flash('residentSignupFailureMessage'),
//   });
// }
// function postupdate(req, res, next) {
//   passport.authenticate('local-resident-update', {
//     successRedirect : '/resident/',
//     failureRedirect : '/resident/studentupdate',
//     failureFlash : true
//   })(req, res, next)
// }

// Handle Resident Registration POST Request
function postSignup(req, res, next) {
  
  passport.authenticate('local-resident-signup', {
    successRedirect : '/resident/',
    failureRedirect : '/resident/signup',
    failureFlash : true
  })(req, res, next)
}

// GET Resident Login Page
function getLogin(req, res) {
  res.render('pages/resident/login', { 
    noResidentEmailFoundOnLogin: req.flash('noResidentEmailFoundOnLogin'),
    incorrectResidentPassword: req.flash('incorrectResidentPassword')
  });
}

// Handle resident Login POST Request
function postLogin(req, res, next) {
 
  passport.authenticate('local-resident-login', {
    successRedirect: '/resident/',
    failureRedirect: '/resident/login',
    failureFlash: true
  })(req, res, next);
  
}

function getUser(req, res) {
  res.send(req.user);
}


// Export Resident Controllers
module.exports = {
  // home:home,
  index: index,
  //index1:index1,
  getSignup: getSignup,
  postSignup: postSignup,
  // getupdate: getupdate,
  // postupdate: postupdate,
  getLogin: getLogin,
  postLogin: postLogin,
  getUser: getUser
}
