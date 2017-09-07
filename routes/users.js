const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

//Developer created stuff
const config = require('../config/database');
const User = require('../models/model_users');

// Register
router.post('/register', (req, res, next) => {
  let newUser = new User({
    fname: req.body.fname,
	lname: req.body.lname,
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
    role: req.body.role
  });

  User.addUser(newUser, (err, user) => {
    if(err){
      return res.json({success: false, msg:'Failed to register user'});
    } else {
      res.json({success: true, msg:'User registered'});
    }
  });
});

// Authenticate
router.post('/authenticate', (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  User.getUserByUsername(username, (err, user) => {
    if(err) throw err;
    if(!user){
      return res.json({success: false, msg: 'User not found'});
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if(err) throw err;
      if(isMatch){
        const token = jwt.sign(user, config.secret, {
          expiresIn: 604800 // 1 week
        });

        res.json({
          success: true,
          token: 'JWT '+token,
          user: {
            id: user._id,
            fname: user.fname,
			      lname: user.lname,
            username: user.username,
            email: user.email,
            role: user.role
          }
        });
      } else {
        return res.json({success: false, msg: 'Wrong password'});
      }
    });
  });
});

// get||update||delete profile (/users/profile)
router.route('/profile')
  .get(passport.authenticate('jwt', {session:false}), (req, res, next) => {
    // console.log(req.user);
    return res.json({user: req.user});
  })
  .put(passport.authenticate('jwt', {session:false}), function(req, res) {
    let user = req.user;
    user.fname = req.body.fname || user.fname;
    user.lname = req.body.lname || user.lname;	
    user.email = req.body.email || user.email;
    user.username = req.body.username || user.username;
	  user.role = req.body.role || user.role;

    user.save(function (err, user) {
      if(err) {
          return res.status(500).send(err)
        }
        res.json(user);
    })
  })
  .delete(passport.authenticate('jwt', {session: false}), function(req, res) {
    let user = req.user;

    user.remove(function(err, user) {
      if(err) {
        return res.json({success: false, message: 'Cannot delete profile'});
      }
      res.json({success: true, message: 'Profile Deleted'});
    })
  })

router.get('/employers', function(req, res, next) {
  User.find({role: /employers/}, {password: 0, messages: 0 }).where('role').equals('employer').exec(function(err, user) {
    if(err) {
      return res.json({success: false, message: 'Cant find employers'})
    }
    res.json(user)

  })
})

router.get('/developers', function(req, res, next) {
  User.find({role: /developers/}, {password: 0, messages: 0}).where('role').equals('developer').exec(function(err, user) {
    if(err) {
      return res.json({success: false, message: 'Cant find developers'})
    }
    res.json(user)

  })
})

router.get('/', function(req, res, next) {
	User.find().exec(function(err, user) {
		if(err) {
			return res.json({success: false, message: 'Users not found'})
		}
		res.json(user)
	})
})


module.exports = router;
