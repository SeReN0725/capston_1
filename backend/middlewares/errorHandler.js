module.exports = (err, req, res, next) => {
  const status = err.status || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const payload = {
    message: err.message || 'Internal Error',
    code,
  };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};