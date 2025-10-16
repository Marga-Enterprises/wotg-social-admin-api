// model imports
const { User } = require('@models');

// utility functions
const { 
    comparePassword, 
    generateToken, 
} = require('@utils/methods');

// validators
const { validateLoginFields } = require('@validators/auth');

exports.loginService = async (data) => {
    const { email, password } = data;

    // Validate that all required fields are provided
    validateLoginFields(data);

    // Find the user by email and if its admin or owner
    const user = await User.findOne({ where: { email, user_role: ['admin', 'owner', 'missionary'] } });
    if (!user) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
    };

    // Compare the provided password with the stored hashed password
    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        const error = new Error('Invalid email or password.');
        error.status = 401;
        throw error;
    }

    // Generate a JWT token for the authenticated user
    const token = generateToken(user);

    // Return the user data and token
    return { token };
}