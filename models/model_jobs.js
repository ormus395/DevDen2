var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./model_users');

var JobSchema = new Schema({
  title: String,
  author: String,
  type: String,
  salary: String,
  details: String,
  employer: {type: Schema.Types.ObjectId, ref: 'User'},
  createdAt: {type: Date, default: Date.now}
});

JobSchema.post('remove', function(job) {
  User.findById(job.employer, function (err, user) {
    user.jobs.pull(job);
    user.save();
  });
});

module.exports = mongoose.model('Jobs', JobSchema);
