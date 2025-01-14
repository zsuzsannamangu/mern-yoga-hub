const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const User = require('../models/User'); // Assuming this is your User model

// Google OAuth Strategy

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await User.findOne({ googleId: profile.id });
                if (existingUser) return done(null, existingUser);

                const newUser = new User({
                    googleId: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    email: profile.emails[0].value,
                    isVerified: true, // Automatically verified
                });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard'); // Redirect after successful login
});

passport.use(
    new MicrosoftStrategy(
        {
            clientID: process.env.MICROSOFT_CLIENT_ID,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
            callbackURL: '/auth/microsoft/callback',
        },
        async (accessToken, refreshToken, params, profile, done) => {
            const decodedProfile = jwt.decode(params.id_token);
            const { email, given_name, family_name } = decodedProfile;

            try {
                const existingUser = await User.findOne({ microsoftId: params.id });
                if (existingUser) return done(null, existingUser);

                const newUser = new User({
                    microsoftId: params.id,
                    firstName: given_name,
                    lastName: family_name,
                    email,
                    isVerified: true, // Automatically verified
                });
                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

router.get('/auth/microsoft', passport.authenticate('microsoft', { scope: ['User.Read'] }));
router.get('/auth/microsoft/callback', passport.authenticate('microsoft', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/dashboard'); // Redirect after successful login
});

// Serialize user (save user ID in session)
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user (fetch user details by ID)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

module.exports = passport;
