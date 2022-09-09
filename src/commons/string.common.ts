export const validChar =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/@*&#';

export const ValidatorMessage = {
  USERNAME_NOT_VALID:
    'Username must contain only letters, numbers, and at least 6 characters',
  PASSWORD_NOT_VALID:
    'Password contain letters, numbers, [/, @, *, &, #] and at least 8 characters',
  VERIFY_CODE_NOT_VALID:
    'Verify code only contains number, contain exact 6 digist',
  UUID_NOT_VALID: 'Id must be valid uuid',
  ACCOUNT_STATUS_NOT_VALID: 'Status must be active, inactive or blocked',
  ROLE_NOT_VALID: 'Role must be customer, staff or superuser',
  FULLNAME_NOT_VALID: 'Fullname only contains letters and space',
  PHONE_NOT_VALID: 'Phone number must be valid phone',
};
