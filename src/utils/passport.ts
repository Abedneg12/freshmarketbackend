import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { GOOGLE_ID, GOOGLE_SECRET, FE_PORT } from "../config";
import { UserRole } from "@prisma/client";

// Google
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_ID!,
      clientSecret: GOOGLE_SECRET!,
      callbackURL:
        "https://freshmarketbackend.vercel.app/api/oauth/google/callback",
    },
    async (_accessToken: string, _refreshToken: string, profile, done) => {
      try {
        const userProfile = {
          id: Number(profile.id),
          provider: "google",
          providerId: profile.id,
          email: profile.emails?.[0].value!,
          displayName: profile.displayName,
          role: UserRole.USER,
          isVerified: true,
        };
        done(null, userProfile);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

export default passport;
