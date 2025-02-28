const joi = require("joi");

exports.signupSchema = joi.object({
  email: joi
    .string()
    .min(6)
    .max(60)
    .required()
    .email(), // Removed tlds restriction

  password: joi
    .string()
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*!-_])[A-Za-z\\d@#$%^&*!-_]{8,20}$"))
    .messages({
      "string.pattern.base":
        "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&*!-_).",
    }),
});

exports.loginSchema = joi.object({
    email: joi
      .string()
      .min(6)
      .max(60)
      .required()
      .email(), // Removed tlds restriction
  
    password: joi
      .string()
      .required()
      .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*!-_])[A-Za-z\\d@#$%^&*!-_]{8,20}$"))
      .messages({
        "string.pattern.base":
          "Password must be 8-20 characters long, include at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&*!-_).",
      }),
  });
exports.acceptCodeSchema = joi.object({
  email:joi.string()
  .min(6)
  .max(60)
  .required()
  .email(
    {
      tlds:{allow:['com','net']}
    }
  ),
  providedCode:joi.number().required()
})
exports.changePasswordSchema = joi.object({
  newPassword:joi.string()
       .required()
       .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*!-_])[A-Za-z\\d@#$%^&*!-_]{8,20}$")),
  oldPassword:joi.string()
           .required()
           .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*!-_])[A-Za-z\\d@#$%^&*!-_]{8,20}$")),

})

exports.acceptFpCodeSchema = joi.object({
  email:joi.string()
  .min(6)
  .max(60)
  .required()
  .email(
    {
      tlds:{allow:['com','net']}
    }
  ),
  providedCode:joi.number().required(),
  newPassword:joi.string()
       .required()
       .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@#$%^&*!-_])[A-Za-z\\d@#$%^&*!-_]{8,20}$")),

})