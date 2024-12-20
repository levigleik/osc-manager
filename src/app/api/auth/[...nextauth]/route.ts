import { authOptions } from "@/auth.config";
import api from "@/lib/api";
import type { NextApiResponse } from "next";
import NextAuth from "next-auth/next";

async function handler(req: any, res: NextApiResponse) {
	return await NextAuth(req, res, {
		...authOptions,
		callbacks: {
			...authOptions.callbacks,
			session: async ({ session, token }) => {
				session.userData = token.userData;
				session.expiresIn = token.expiresIn;
				session.idToken = token.idToken;
				return session;
			},
			signIn: async ({ user, account, profile }) => {
				try {
					if (account) {
						account.userData = user as any;
						await api.post("/auth/login", { ...account });
					}
					return true;
				} catch (error: any) {
					if (error?.response.status === 403) {
						return `/aguardandoAprovacao?email=${user.email}`;
					}
					return false;
				}
			},
		},
	});
}

export { handler as GET, handler as POST };
