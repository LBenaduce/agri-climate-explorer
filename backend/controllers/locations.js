const Location = require("../models/location");

module.exports.getLocations = (req, res, next) => {
  Location.find({ owner: req.user._id })
    .sort({ createdAt: -1 })
    .then((items) => res.send(items))
    .catch(next);
};

module.exports.createLocation = (req, res, next) => {
  Location.create({
    ...req.body,
    owner: req.user._id
  })
    .then((item) => res.status(201).send(item))
    .catch(next);
};

module.exports.deleteLocation = (req, res, next) => {
  Location.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    .then((item) => {
      if (!item) {
        const error = new Error("Location not found");
        error.statusCode = 404;
        throw error;
      }

      res.send(item);
    })
    .catch(next);
};