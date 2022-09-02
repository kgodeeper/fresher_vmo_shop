export const UUID_REGEX = new RegExp(
  '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$',
);

export const PASSWORD_REGEX = new RegExp(
  '^(?=.*[a-zA-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$',
);

export const USERNAME_REGEX = new RegExp('[a-zA-Z0-9]{6,}$');

export const PHONE_REGEX = new RegExp('[0-9]{10,11}$');

export const VERIFY_CODE_REGEX = new RegExp('[0-9]{6,6}$');

export const FULLNAME_REGEX = new RegExp('[a-zA-Z ]{2,}$');
