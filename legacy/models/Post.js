const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true }, // sender id
    content: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
