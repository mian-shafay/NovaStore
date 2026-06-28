const AuditLog = require('../models/AuditLog');

const logAudit = async (entry) => {
  try {
    await AuditLog.create(entry);
  } catch (error) {
    console.error('Audit logging failed:', error.message);
  }
};

module.exports = { logAudit };
