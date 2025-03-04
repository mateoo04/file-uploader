module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(401).redirect('/log-in');
  }
};

module.exports.isNotAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    res.redirect('/');
  } else next();
};
