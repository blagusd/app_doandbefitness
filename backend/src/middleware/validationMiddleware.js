const Joi = require("joi");

// user registration validation
exports.validateUserRegistration = (req, res, next) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    role: Joi.string().valid("client", "admin").default("client"),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// login validation
exports.validateUserLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// exercise validation
exports.validateExercie = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    youtubeLink: Joi.string().uri().required(),
    muscleGroup: Joi.string().optional(),
  });
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// plan validation
exports.validatePlan = (req, res, next) => {
  const schema = Joi.object({
    name: Joi.string().min(2).required(),
    weekNumber: Joi.number().min(1).required(),
    workouts: Joi.array()
      .items(
        Joi.object({
          day: Joi.string().required(),
          exercises: Joi.array()
            .items(Joi.string().hex().length(24))
            .required(), // ObjectId string
        })
      )
      .required(),
    assignedTo: Joi.string().hex().length(24).required(), // User ObjectId
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};

// progress validation
exports.validateProgressEntry = (req, res, next) => {
  const schema = Joi.object({
    exerciseId: Joi.string().hex().length(24).required(),
    sets: Joi.number().min(1).required(),
    reps: Joi.number().min(1).required(),
    weight: Joi.number().min(0).optional(),
  });

  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
