import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_ID, GOOGLE_SECRET, FE_PORT } from "../config";

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

// Google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_ID!,
      clientSecret: GOOGLE_SECRET!,
      callbackURL: `${FE_PORT}/api/auth/google/callback`,
    },
    async (_accessToken: string, _refreshToken: string, profile, done) => {
      try {
        const userProfile = {
          provider: "google",
          providerId: profile.id,
          email: profile.emails?.[0].value!,
          displayName: profile.displayName,
        };
        done(null, userProfile);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport;
