const { body, validationResult } = require("express-validator");

exports.signupValidation = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("Name must be between 3 and 20 characters.")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body("password")
        .isLength({ min: 6, max: 50 })
        .withMessage("Name must be between 6 and 50 characters.")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),

    body("email")
        .trim()
        .isEmail()
        .withMessage("Invalid email format.")
        .normalizeEmail(),

    body("name")
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage("Message must be between 3 and 50 characters.")
];

exports.loginValidation = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 20 })
        .withMessage("Name must be between 3 and 20 characters.")
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),

    body("password")
        .isLength({ min: 6, max: 50 })
        .withMessage("Name must be between 6 and 50 characters.")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
];
exports.validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        })
    }
    next();
}
