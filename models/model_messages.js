var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = require('./model_users');

var MessageSchema = new Schema({
    content: {type: String, required: true},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    createdAt: {type: Date, default: Date.now}
});

MessageSchema.post('remove', function(message) {
  User.findById(message.user, function (err, user) {
    user.messages.pull(message);
    user.save();
  });
});

module.exports = mongoose.model('Messages', MessageSchema);