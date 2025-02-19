import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // // Add user data to session
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: { role: true, id: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser?.id,
          role: dbUser?.role,
        },
      };
      return session;
    },
    async signIn({ user, account }) {
      if (!user.email) {
        return false;
      }

      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || "",
              role: null,
              image: user.image,
            },
          });
          // return true;
        }

        // Check if existing user has no role
        // if (existingUser && !existingUser.role) {
        //   // return "/dashboard/continue";
        //   return true;
        // }
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // Handle custom redirects
      if (url.startsWith("/dashboard/continue")) {
        return `${baseUrl}/dashboard/continue`;
      }
      // Default redirect behavior
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
    newUser: "/dashboard/continue",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
