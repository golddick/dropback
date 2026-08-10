import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { verifyOtp } from "./dropaphi";
import { prisma } from "./prisma";
import { newUserId } from "./ids";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.code) return null;

        const { verified } = await verifyOtp(
          credentials.email,
          credentials.code
        );
        if (!verified) return null;

        const user = await prisma.user.upsert({
          where: { email: credentials.email },
          update: {},
          create: { id: newUserId(), email: credentials.email },
        });

        return { id: user.id, email: user.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
};
