import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import {
    customSession,
    organization,
    magicLink,
    twoFactor,
} from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { admin, member } from "@/lib/permissions";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import {
    createOrganization,
    getActiveOrganization,
} from "@/server/organizations";
import { sendEmail } from "@/lib/resend";
import OrganizationInvitationEmail from "@/components/emails/organization-invitation-email";
import MagicLinkEmail from "@/components/emails/magic-link-email";
import { User } from "@prisma/client";

export const auth = betterAuth({
    appName: "Multi-tenant SaaS Boilerplate",
    baseURL: process.env.NEXT_PUBLIC_APP_URL,
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60, // Cache duration in seconds
        },
    },
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            title: {
                type: "string",
                required: false,
            },
            bio: {
                type: "string",
                required: false,
            },
            theme: {
                type: "string",
                defaultValue: "system",
                required: false,
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    onAPIError: {
        throw: true,
        onError: (error) => {
            // Custom error handling
            console.error("Auth error:", error);
        },
        errorURL: "/auth/error",
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    // Create a personal organization for the user
                    await createOrganization(
                        user.id,
                        {
                            name: "Personal",
                            slug: "personal",
                        },
                    );
                },
            },
        },
        session: {
            create: {
                before: async (session) => {
                    const organization = await getActiveOrganization(
                        session.userId,
                    );
                    return {
                        data: {
                            ...session,
                            activeOrganizationId: organization?.id,
                        },
                    };
                },
            },
        },
    },
    plugins: [
        organization({
            creatorRole: "admin",
            async sendInvitationEmail(data) {
                const { success, error } = await sendEmail({
                    to: data.email,
                    subject: `Invitation to join ${data.organization.name} in Boilerplate`,
                    react: OrganizationInvitationEmail({
                        organizationName: data.organization.name,
                        inviterName: data.inviter.user.name || "Someone",
                        inviteeEmail: data.email,
                        invitationId: data.id,
                        role: data.role,
                    }),
                });

                if (!success) {
                    console.error("Error sending invitation email:", error);
                }
            },
            roles: {
                admin,
                member,
            },
        }),
        customSession(async ({ user, session }) => {
            const organization = await getActiveOrganization(session.userId);
            return {
                user: {
                    ...user,
                    role: organization?.role,
                    title: (user as User).title || "",
                    bio: (user as User).bio || "",
                    theme: (user as User).theme || "system",
                },
                session,
                activeOrganizationId: organization?.id,
            };
        }),

        magicLink({
            expiresIn: 60 * 5, // 5 minutes
            sendMagicLink: async ({ email, url }) => {
                await sendEmail({
                    to: email,
                    subject: "Your Magic Link is Here!",
                    react: MagicLinkEmail({ email, magicLink: url }),
                });
            },
        }),
        twoFactor({
            issuer: "Multi-tenant SaaS Boilerplate",
        }),
        apiKey([
            {
                // Default config — org-scoped API keys for the Route API
                configId: "default",
                references: "organization",
                defaultPrefix: "sk_",
                enableMetadata: true,
                // enableSessionForAPIKeys is intentionally NOT set — leaked keys must not impersonate sessions
                rateLimit: {
                    enabled: true,
                    maxRequests: 1000,
                    timeWindow: 1000 * 60 * 60, // 1 hour
                },
            },
        ]),
        nextCookies(), // MUST remain last
    ],
});

export type Session = typeof auth.$Infer.Session;
