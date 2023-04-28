export const NAME_REGEX = /^[A-Za-zÀ-ž]{3,32}$/;
export const USERNAME_REGEX = /^[A-Za-zÀ-ž][A-Za-zÀ-ž0-9_\-]{3,32}$/;
export const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?!.*[\s\n]).{6,50}/;
export const INVALID_PASSWORD_MSG = "The password must contain at least one uppercase, one lowercase, one number and one special character";

/**
 * La url de instagram es opcional.
 * Puede ser un strig vacío o seguir el patrón especificado.
 */
export const IG_REGEX = /^$|^https:\/\/(www\.)?instagram\.com\/.+$/i;

/**
 * La url de facebook es opcional.
 * Puede ser un strig vacío o seguir el patrón especificado.
 */
export const FB_REGEX = /^$|^https:\/\/(www\.)?facebook\.com\/.+$/i;

/**
 * La url de twitter es opcional.
 * Puede ser un strig vacío o seguir el patrón especificado.
 */
export const TW_REGEX = /^$|^https:\/\/(www\.)?twitter\.com\/.+$/i;