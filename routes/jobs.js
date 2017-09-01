const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// Developer created stuff
const config = require('../config/database');
const Jobs = require('../models/model_jobs');
const User = require('../models/model_users');


router.get('/', function(req, res, next) {
    Jobs.find()
        .populate('user', 'name')
        .exec(function(err, jobs) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            res.status(200).json({success: true, obj: jobs});
        });

});

router.post('/', passport.authenticate('jwt', {session:false}), function(req, res, next) {
    console.log(req.user.id);
    User.findById(req.user.id, function (err, user) {
        if(err) {
            return res.status(500).json({success: false, message: 'An error occurred'});
        }
        let newJob = new Jobs({
            title: req.body.title,
            type: req.body.type,
            salary: req.body.salary,
            details: req.body.details,
            employer: user
        });

         newJob.save(function (err, result) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            user.jobs.push(result);
            user.save();
            res.status(201).json({success: true, message: 'Posted Jaab', obj: result});
        });

    });
});

router.patch('/:id', passport.authenticate('jwt', {session:false}), function(req, res, next) {
    console.log(req.user.id);
    Jobs.findById(req.params.id, function(err, job) {
        if(err) {
            return res.status(500).json({success: false, message: 'An error occurred'});
        }
        if(!job) {
            return res.status(500).json({success: false, message: 'Jaab not found'});
        }
        if(job.author != req.user.id) {
            return res.status(401).json({success: false, message: 'This aint yo jaab'});
        }
        job.title = req.body.title || job.title;
        job.type = req.body.type || job.type;
        job.salary = req.body.salary || job.salary;
        job.details = req.body.details || job.details;
        job.save(function(err, result) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            res.status(200).json({success: true, message: 'Jaab updated', obj: result});
        });
    });
});

router.delete('/:id', passport.authenticate('jwt', {session:false}), function(req, res, next) {
    Jobs.findById(req.params.id, function(err, job) {
        if(err) {
            return res.status(500).json({success: false, message: 'An error occurred'});
        }
        if(!job) {
            return res.status(500).json({success: false, message: 'Jaab not found'});
        }
        if(job.author != req.user.id) {
            return res.status(401).json({success: false, message: 'This aint you jaaab'});
        }
        job.remove(function(err, result) {
            if(err) {
                return res.status(500).json({success: false, message: 'An error occurred'});
            }
            res.status(200).json({success: true, message: 'Job deleted'});

        });
    });
});  




module.exports = router;
