const mongoose = require("mongoose")
const Store = mongoose.model("Store");
const multer = require("multer");
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
  storage: multer.memoryStorage(),
  fileFilter(req, file, next){
    const isPhoto = file.mimetype.startsWith('image/');
    if(isPhoto){
      next(null, true);
    } else {
      next({ message: "That filetype isn't allowed!"}, false)
    }
  }
};

exports.homePage = (req, res) => {
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', {title: "Add Store"})
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  //check if there is no new file to resize
  if(!req.file){
    next();
    return
  }
  const extension = req.file.mimetype.split('/')[1];
  req.body.photo = `${uuid.v4()}.${extension}`;

  // now resize
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`)

  //once we have written to the filesystem, keep going!
  next();
}

exports.createStore = async (req, res) => {
  const store = await (new Store(req.body)).save();
  req.flash("success", `Successfully created ${store.name}, care to leave a review?`);
  res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {title: 'Stores', stores});
}

exports.editStore = async (req, res) => {
  // find the store given the id
  const store = await Store.findOne({_id: req.params.id});
  //confirm they are the owner of the store
  //TODO
  //render out the edit form so the user can update their store
  res.render("editStore", {title: `Edit ${store.name}`, store});
};

exports.updateStore = async (req, res) => {
  req.body.location.type = "Point";
  // find and update the store
  const store = await Store.findOneAndUpdate({_id: req.params.id}, req.body, {
    new: true, //return the new store instead of old store
    runValidators: true
  }).exec();
  req.flash("success", `Successfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}"></a>`)
  res.redirect(`/stores/${store._id}/edit`)
  //redierect to the store page and tell them it worked
}
