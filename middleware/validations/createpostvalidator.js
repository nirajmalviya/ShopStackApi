const Joi = require("joi");


const PostSchemaValidation = Joi.object({
        title :Joi.string().min(3).required(),
        description:Joi.string().min(3).required(),
        date:Joi.date().required(),
        createdby:Joi.string().required()
})

module.exports  = {PostSchemaValidation};
        