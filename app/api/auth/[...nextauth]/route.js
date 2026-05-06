import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import ClubAccess from "@/lib/models/ClubAccess";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  callbacks: {
    // Called after Google login — check if email is in our ClubAccess table
    async signIn({ user }) {
      try {
        await connectDB();
        const access = await ClubAccess.findOne({ email: user.email.toLowerCase() });
        // If email not in our DB, block login
        if (!access) return false;
        return true;
      } catch {
        return false;
      }
    },

    // Add clubCode and clubName into the JWT token
    async jwt({ token, user }) {
      if (user) {
        // First login — fetch club info and embed in token
        await connectDB();
        const access = await ClubAccess.findOne({ email: user.email.toLowerCase() });
        if (access) {
          token.clubCode = access.clubCode;
          token.clubName = access.clubName;
        }
      }
      return token;
    },

    // Expose clubCode and clubName in the session object
    async session({ session, token }) {
      session.user.clubCode = token.clubCode;
      session.user.clubName = token.clubName;
      return session;
    },
  },

  pages: {
    signIn: "/login",           // Our custom login page
    error: "/login",            // Redirect errors back to login
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };