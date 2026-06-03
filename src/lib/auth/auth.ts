// src/lib/auth/auth.ts
// Configuració de NextAuth.js
// - Pare/professor: Magic Link (email sense contrasenya)
// - Nen: PIN de 4 dígits (credentials provider)

import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { db } from "@/lib/db";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    // JWT per als credentials (PIN de nen)
    // Database sessions per als magic links
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify", // "revisa el teu email"
    error: "/login/error",
  },
  providers: [
    // ── Magic Link per a pares i professors ──
    EmailProvider({
  from: process.env.RESEND_FROM_EMAIL!,
  sendVerificationRequest: async ({ identifier: email, url }) => {
    try {
      const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!, // Ha de ser el domini verificat o onboarding@resend.dev
        to: [email],
        subject: "🎓 Accedeix a Educamagics",
        html: magicLinkTemplate(url),
      });

      if (error) {
        console.error("Error detallat de Resend:", error);
        throw new Error("Resend API error: " + error.message);
      }
      
      console.log("Email enviat correctament a:", email, "ID:", data?.id);
    } catch (error) {
      console.error("Error en sendVerificationRequest:", error);
      throw error;
    }
  },
}),
    // ── PIN de 4 dígits per a nens ──
    CredentialsProvider({
  id: "child-pin",
  name: "Child PIN",
  credentials: {
    childProfileId: { label: "Child Profile ID", type: "text" },
    pin: { label: "PIN", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.childProfileId || !credentials?.pin) return null;

    const childProfile = await db.childProfile.findUnique({
      where: { id: credentials.childProfileId },
      include: { user: true }
    });

    if (!childProfile) return null;

    // Comparem el PIN introduït amb el hash de la BD
    const isValid = await bcrypt.compare(credentials.pin, childProfile.pinHash);
    
    if (isValid) {
      return { id: childProfile.userId, role: "CHILD", name: "Estudiant" };
    }
    return null;
  },
}),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Afegim el rol al token en el primer login
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role ?? "PARENT";
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};

// ── Extensió de tipus de NextAuth ──
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    role: string;
  }
}

// ── Template d'email ──
function magicLinkTemplate(url: string): string {
  return `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
      <h1 style="font-size:24px;color:#1a1a2e">🎓 Educamagics</h1>
      <p style="color:#444;font-size:16px;line-height:1.6">
        Fes clic al botó per accedir al teu compte. 
        L'enllaç caduca en 24 hores.
      </p>
      <a href="${url}" 
         style="display:inline-block;background:#6c47ff;color:white;
                padding:14px 28px;border-radius:8px;text-decoration:none;
                font-weight:600;font-size:16px;margin:16px 0">
        Accedir ara
      </a>
      <p style="color:#888;font-size:13px">
        Si no has demanat aquest accés, pots ignorar aquest missatge.
      </p>
    </div>
  `;
}
