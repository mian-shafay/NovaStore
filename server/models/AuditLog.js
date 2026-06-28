const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = system
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String },
  metadata: { type: Object, default: {} },
  ip: { type: String },
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
