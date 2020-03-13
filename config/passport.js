const LocalStrategy = require('passport-local').Strategy;
const Guest         = require('../models/guest');
const Resident      = require('../models/resident');
// Understanding Serialize/Deserialize: https://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize 
// Github issue serializing two different LOCAL strategies: https://github.com/jaredhanson/passport/issues/50 
// How to solve: https://stackoverflow.com/a/24336272/8211101

/**
 * Todo: create docs for this function
 * 
 * @param {*} userId 
 * @param {String} userGroup Multi User identifier
 * @param {String} details Add comments to remember this user type
 */
function SessionConstructor(userId, userGroup, details) {
  this.userId = userId;
  this.userGroup = userGroup;
  this.details = details;
}

module.exports = function(passport) {

  passport.serializeUser(function (userObject, done) {
    // userObject could be a Guest or a Resident... eventually maybe an Admin also
    let userGroup = "guest"; // Default value, could be anything
    let userPrototype =  Object.getPrototypeOf(userObject);
    if (userPrototype === Guest.prototype) {
        userGroup = "guest";
    } else if (userPrototype === Resident.prototype) {
        userGroup = "resident";
    } 
    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
    done(null,sessionConstructor);
  });

  passport.deserializeUser(function (sessionConstructor, done) {
    if (sessionConstructor.userGroup == 'guest') {
      Guest.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);
      });
    } else if (sessionConstructor.userGroup == 'resident') {
      Resident.findOne({
          _id: sessionConstructor.userId
      }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
          done(err, user);
      });
    } 
  });


  // LOCAL-GUEST-SIGNUP STRATEGY
  passport.use('local-guest-signup', new LocalStrategy({
      // By default, local strategy uses username and password, we will override with email
      usernameField : 'email',
      passwordField : 'password',
      passReqToCallback : true, // allows us to pass back the entire request to the callback
    },

    function(req, email, password, done) {
      
      // asynchronous
      // Guest.findOne wont fire unless data is sent back
      process.nextTick(function() {

      Guest.findOne({ 'localStrategy.email' :  email }, function(err, guest) {

        // Return error on error
        if (err)
          return done(err);

        // check to see if theres already a user with that email
        if (guest) {
          return done(null, false, req.flash('guestSignupFailureMessage', 'That email is already taken.'));
        } else {
          // Create guest if email does not exist
          let newGuest = new Guest();

          // Local Credentials
          newGuest.localStrategy.email = email;
          newGuest.localStrategy.password = newGuest.generateHash(password);
          newGuest.firstName = req.body.first_name;
          newGuest.lastName = req.body.last_name;
          newGuest.roll=req.body.roll;
          newGuest.contact=req.body.contact;
          newGuest.branch=req.body.branch;
          newGuest.year=req.body.year;
          newGuest.skills=req.body.skills;
          newGuest.github=req.body.github;
          newGuest.company=req.body.company;
          newGuest.image=req.file.filename;
          newGuest.userGroup = "Guest";

          // save the guest
          newGuest.save(function(err) {
            if (err)
              throw err;
            return done(null, newGuest, req.flash('guestSignupSuccessMessage', 'Success!'));
          });
        }
      })
      })
    }
  )); //END LOCAL-GUEST-SIGNUP

  
  // LOCAL-GUEST-LOGIN STRATEGY
  passport.use('local-guest-login', new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
  
    function(req, email, password, done) {
      Guest.findOne({ 'localStrategy.email': email}, function(err, guest) {
        
        if (err)
          return done(err);
        
        if (!guest) {
          return done(null, false, req.flash('noGuestEmailFoundOnLogin', 'Email does not exist!'));
        }

        if (!guest.validPassword(password))
          return done(null, false, req.flash('incorrectGuestPassword', 'Oops! Wrong password.'));

        return done(null, guest);
        
      })
    }
  )); //END LOCAL-GUEST-LOGIN

  // LOCAL-RESIDENT-SIGNUP STRATEGY
  passport.use('local-resident-signup', new LocalStrategy({
      // By default, local strategy uses username and password, we will override with email
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },

    function(req, email, password, done) {

      // asynchronous
      // Resident.findOne wont fire unless data is sent back
      process.nextTick(function() {

      Resident.findOne({ 'localStrategy.email': email }, function(err, resident) {

        if (err)
          return done(err);

        if (resident) {
          return done(null, false, req.flash('residentSignupFailureMessage', 'That email is already taken.'));
        } else {

          let newResident = new Resident();
          if(req.file){
            newResident.localStrategy.email = email;
          newResident.localStrategy.password = newResident.generateHash(password);
          newResident.firstName = req.body.first_name;
          newResident.lastName = req.body.last_name;
          newResident.roll=req.body.roll;
          newResident.contact=req.body.contact;
          newResident.branch=req.body.branch;
          newResident.year=req.body.year;
          newResident.skills=req.body.skills;
          newResident.github=req.body.github;
          newResident.image=req.file.filename;
          newResident.userGroup = "Resident";
          }
          else
          {
            newResident.localStrategy.email = email;
          newResident.localStrategy.password = newResident.generateHash(password);
          newResident.firstName = req.body.first_name;
          newResident.lastName = req.body.last_name;
          newResident.roll=req.body.roll;
          newResident.contact=req.body.contact;
          newResident.branch=req.body.branch;
          newResident.year=req.body.year;
          newResident.skills=req.body.skills;
          newResident.github=req.body.github;
          newResident.userGroup = "Resident";
          }
          

          // save the resident
          newResident.save(function(err) {
            if (err)
              throw err;
            return done(null, newResident, req.flash('residentSignupSuccessMessage', 'Success!'));
          });
        }
      })
      })
    }
  )); // END LOCAL-RESIDENT-SIGNUP

  // LOCAL-RESIDENT-LOGIN STRATEGY
  passport.use('local-resident-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },

  function(req, email, password, done) {
    Resident.findOne({ 'localStrategy.email': email}, function(err, resident) {
      
      if (err)
        return done(err);
      
      if (!resident) {
        return done(null, false, req.flash('noResidentEmailFoundOnLogin', 'Email does not exist!'));
      }

      if (!resident.validPassword(password))
        return done(null, false, req.flash('incorrectResidentPassword', 'Oops! Wrong password.'));

      return done(null, resident);
      
    })
  }
)); //END LOCAL-RESIDENT-LOGIN
}

