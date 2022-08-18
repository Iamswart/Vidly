const Joi = require('joi');
const moment = require('moment');
const {Rental} = require('../models/rentals');
const {Movies} = require('../models/movies');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const express = require('express');
const router = express.Router();




router.post('/', [auth, validate(validateReturn)], async(req, res) => {
    const rental = await Rental.lookup(req.body.customerId, req.body.movieId);

    
    if(!rental) return res.status(404).send('Rental not found');
    if(rental.dateReturned) return res.status(400).send('Return already processed');

    rental.return();
    await rental.save();

    await Movies.updateOne({_id: rental.movie.id},{ $inc: {numberInStock: 1}});

    return res.send(rental);
    //res.status(401).send('Unauthorized');
});

function validateReturn(req) {
    const schema = Joi.object({
      customerId: Joi.objectId().required(),
      movieId: Joi.objectId().required()
  });
  
  return schema.validate(req);
}

module.exports = router;