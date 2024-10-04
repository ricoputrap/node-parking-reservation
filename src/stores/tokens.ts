/**
 * The key will be the token string.
 * The value will be in seconds, representing the unix timestamp
 * when the token will expire.
 * 
 * Utilize cronjob to clear the blacklisted tokens
 * when they are expired.
 * 
 * TODO: Utilize Redis (in-memory database)
 */
export const blacklistedAccessTokens: Record<string, number> = {};
export const blacklistedRefreshTokens: Record<string, number> = {};