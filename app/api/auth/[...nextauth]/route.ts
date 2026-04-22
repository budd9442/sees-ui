import { handlers } from "@/auth"; // Referring to d:\SDP\app\auth.ts
/**
 * @swagger
 * /api/auth/{nextauth}:
 *   get:
 *     summary: NextAuth.js authentication (GET)
 *     description: Handles authentication requests for NextAuth.js (signin, callback, session, etc).
 *     parameters:
 *       - in: path
 *         name: nextauth
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: NextAuth.js authentication (POST)
 *     description: Handles authentication requests for NextAuth.js (signin, callback, session, etc).
 *     parameters:
 *       - in: path
 *         name: nextauth
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
export const { GET, POST } = handlers;
