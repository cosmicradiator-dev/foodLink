module.exports = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FoodLink Vercel Serverless API is operational',
    timestamp: new Date().toISOString(),
  });
};
