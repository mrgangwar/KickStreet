import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';


export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter email and password');
        }

        await dbConnect();
        
        // Email case-insensitive check
        const user = await User.findOne({ 
          email: credentials.email.toLowerCase() 
        }).select("+password");
        
        if (!user) throw new Error('No account found with this email');

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error('Invalid credentials');

        if (!user.isVerified) throw new Error('Please verify your account first');

        // Return user data for the JWT
        return { 
          id: user._id.toString(), 
          name: user.name, 
          email: user.email, 
          role: user.role || 'user', 
          phone: user.phone 
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).phone = token.phone;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', 
  },
  secret: process.env.NEXTAUTH_SECRET,
};


export default NextAuth(authOptions);