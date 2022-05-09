export default function handler(req, res) {
    const { email, password } = req.body;

    if(!email || !password) {
        res.status(400).json({
            error: ['Email and password are required'],
            success: false
        });
        return;
    }
    const result = {error: [], success: false}

    //email
    if(!/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(email)) {
        result.error.push('Email is not valid');
    }

    //password
    // at least 8 characters
    if(password.length < 8) result.error.push('Password must be at least 8 characters');
    // at least one number
    else if(!/\d/.test(password)) result.error.push('Password must contain at least one number');
    // at least one uppercase letter
    else if(!/[A-Z]/.test(password)) result.error.push('Password must contain at least one uppercase letter');
    // at least one special character
    else if(!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) result.error.push('Password must contain at least one special character');

    if(result.error.length > 0) {
        res.status(400).json(result);
    } else {
        res.json({'success': true})
    }
}