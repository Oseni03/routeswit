import {
	customSessionClient,
	organizationClient,
	magicLinkClient,
	twoFactorClient,
} from "better-auth/client/plugins";
import { apiKeyClient } from "@better-auth/api-key/client";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
	plugins: [
		inferAdditionalFields<typeof auth>(),
		organizationClient(),
		customSessionClient<typeof auth>(),
		magicLinkClient(),
		apiKeyClient(),
		twoFactorClient({
			onTwoFactorRedirect() {
				window.location.href = "/2fa";
			},
		}),
	],
});
