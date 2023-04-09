export const NAME_REGEX = /^[A-Za-zÀ-ž]{3,32}$/;
export const USERNAME_REGEX = /^[A-Za-zÀ-ž][A-Za-zÀ-ž0-9_\-]{3,32}$/;
export const PASSWORD_REGEX = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_])(?!.*[\s\n]).{6,50}/;
export const INVALID_PASSWORD_MSG = "The password must contain at least one uppercase, one lowercase, one number and one special character";