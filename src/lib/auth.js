import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
          include: { deliveryAgent: true },
        });

        if (!user) {
          throw new Error("No account found with that email.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          country: user.country,
          city: user.city,
          image: user.image,
          location: user.deliveryAgent?.location ?? null,
          vehicleType: user.deliveryAgent?.vehicleType ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.location = user.location;
        token.phone = user.phone;
        token.country = user.country;
        token.city = user.city;
        token.image = user.image;
        token.vehicleType = user.vehicleType;
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.country !== undefined) token.country = session.country;
        if (session.city !== undefined) token.city = session.city;
        if (session.image !== undefined) token.image = session.image;
        if (session.role !== undefined) token.role = session.role;
        if (session.location !== undefined) token.location = session.location;
        if (session.vehicleType !== undefined)
          token.vehicleType = session.vehicleType;
      }

      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.location = token.location;
        session.user.phone = token.phone;
        session.user.country = token.country;
        session.user.city = token.city;
        session.user.image = token.image;
        session.user.vehicleType = token.vehicleType;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
