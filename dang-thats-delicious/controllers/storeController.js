exports.myMiddleware = (req, res, next) => {
  req.name = "wes";
  res.cookie('name', "Briggs is cool", {maxAge: 900000000000000})
  next();
}

exports.homePage = (req, res) => {
  console.log(req.name);
  res.render('index');
}
