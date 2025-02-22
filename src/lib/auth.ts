import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";

const authOptions: NextAuthOptions = {
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
        select: { role: true, id: true, image: true },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: dbUser?.id,
          role: dbUser?.role,
          image: dbUser?.image,
        },
      };
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
              image: user.image?.slice(0, -6),
            },
          });
        }
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

export default authOptions;