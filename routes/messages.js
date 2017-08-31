const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Developer created stuff
const config = require('../config/database');
const User = require('../models/model_users');
const Messages = require('../models/model_messages');

router.get('/', function(req, res, next) {
    Messages.find()
        .populate('user', 'username')
        .exec(function(err, messages) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            res.status(200).json({success: true, obj: messages});
        });

});

router.post('/', passport.authenticate('jwt', {session:false}), function(req, res, next) {
    User.findById(req.user.id, function (err, user) {
        if(err) {
            return res.status(500).json({success: false, message: 'An error occurred'});
        }
        let newMessage = new Messages({
            content: req.body.content,
            user: user
        });

         newMessage.save(function (err, result) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            user.messages.push(result);
            user.save();
            res.status(201).json({success: true, message: 'Posted Message', 
                obj: result});
        });

    });
});

router.delete('/:id', passport.authenticate('jwt', {session:false}), function(req, res, next) {
    Messages.findById(req.params.id, function(err, message) {
        if(err) {
            return res.status(500).json({success: false, message: 'An error occurred'});
        }
        if(!message) {
            return res.status(500).json({success: false, message: 'Jaab not found'});
        }
        if(message.user != req.user.id) {
            return res.status(401).json({success: false, message: 'This aint you message'});
        }
        message.remove(function(err, result) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            res.status(200).json({success: true, message: 'Message deleted'});

        });
    });
});  

module.exports = router;