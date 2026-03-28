export const premiumAudio = (req, res, next) => {
  const { type } = req.body;
  if (type && type.toLowerCase() === 'audio' && req.user.role !== 'premium') {
    return res.status(403).json({ error: 'Audio messages require a premium account' });
  }
  next();
};
