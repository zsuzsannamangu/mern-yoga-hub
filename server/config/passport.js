const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/user/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with googleId
        let user = await User.findOne({ googleId: profile.id });

        // If not, try finding user by email and link googleId
        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          if (user) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        // If still no user, create new one
        if (!user) {
          user = new User({
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            email: profile.emails[0].value,
            isVerified: true, // Auto-verify OAuth users
          });
          await user.save();
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);


// Microsoft Strategy
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/api/user/auth/microsoft/callback`,
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
          isVerified: true,
        });
        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
