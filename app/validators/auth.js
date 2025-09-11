// validateLoginFields function to validate the fields required for user login
exports.validateLoginFields = (data) => {
    const { email, password } = data;
    
    if (!email || !password) {
        throw new Error('Email and password are required.');
    }
    
    return true;
}