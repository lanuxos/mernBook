as you are full stack developer using MERN, help me build a simple web app, start with backend as instruction below:
- the application name "electrically", which is an app for booking electrician services.
- user role on the system are: admin [can manage all the booking records], customer [can book services, and only view their own records], electrician [can view their incoming bookings, can reject/accept bookings]
- customer can register and book the service, but electrician need verification approve from admin before could use the system
- below is profile/user model
```
// Profile/User model
const mongoose = require('mongoose');
const { hashPassword } = require('../utils/passwordUtils');

const profileSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxLength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        // required: [true, 'Last name is required'],
        trim: true,
        maxLength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        // required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    tel: {
        type: String,
        required: [true, 'Mobile number is required'],
        unique: true,
        trim: true,
        minlength: [10, 'Mobile number format as 20XXXXXXXX'],
        maxLength: [10, 'Mobile number format as 20XXXXXXXX'],
        match: [/^[0-9]+$/, 'Mobile number can only contain numbers 0-9']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long']
    },
    role: {
        type: String,
        enum: ['customer', 'electrician', 'admin'],
        default: 'customer'
    },
    // approve
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: Boolean,
        default: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            required: true,
            default: [102.57, 17.95]
        }
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    },
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 2592000 // 30 days
        }
    }],
}, {
    timestamps: true
});

// Virtual for full name
profileSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
profileSchema.pre('save', async function (next) {
    // Only hash if password was modified
    if (!this.isModified('password')) return next();

    try {
        this.password = await hashPassword(this.password);
        next();
    } catch (error) {
        next(error);
    }
});

// Remove password from JSON output
profileSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    delete user.loginAttempts;
    delete user.lockUntil;
    return user;
};

// Account lock methods
profileSchema.methods.incLoginAttempts = function () {
    // If we have previous lock and it's expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: {
                loginAttempts: 1
            },
            $unset: {
                lockUntil: 1
            }
        });
    }

    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
    }

    return this.updateOne(updates);
};

// Reset login attempts
profileSchema.methods.resetLoginAttempts = function () {
    return this.updateOne({
        $unset: {
            loginAttempts: 1,
            lockUntil: 1
        }
    });
};

module.exports = mongoose.model('Profile', profileSchema);
```
- below is booking model
```
// Booking model
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    electricianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schedule: {
        type: Date,
        required: true,
        default: Date.now
    },
    detail: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    location: {
        type: 'Point',
        coordinates: {
            type: [Number],
            required: true,
            default: [102.57, 17.95]
        }
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    review: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }

});
```
- you can suggest if there is a better way to store the data
- when customer want to view record, they query only their id, same as electrician
- when customer want to book a service, they need to store their id and choose electrician to store electrician id on booking record too
- create for me the script to init run the admin account create if there is no existed
- package/library using on the project include: express, helmet morgan dotenv mongoose jsonwebtoken bcryptjs express-validator express-rate-limit cors for solid security
- for the .env variable just leave it blank, i will add it later myself
- structure split cleanly-clear as controllers, middleware, models, routers, scripts, utils
- prepare postman collection for testing backend such as: login to get token, customer register-create booking, fetch booking, admin fetch all booking and other for backend testing purpose
- continue generate frontend using react/vite to connect with backend properly
- packages include: tailwind, react-router-dom, axios, react-hook-form yup@hookform/resolvers, cors, sweetalert2
- using black-yellow mobile theme
- user can search for electrician/service on homepage
- booking service, if user is not log-in redirect to login page 
- pages: register, login, dashboard [after login redirect to this page, based on role, and show content accordingly such as: admin can view all records, customer/electrician only view their own records], home [no need to login, can browse/search for service, show all available electrician]
- structure clearly-clean such as: components, services, utils