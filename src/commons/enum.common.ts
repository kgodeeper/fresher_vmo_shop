export enum Role {
  SUPERUSER = 'superuser',
  STAFF = 'staff',
  CUSTOMER = 'customer',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum AccountStatus {
  BLOCKED = 'blocked',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  ORTHER = 'orther',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  REFUND = 'refund',
}

export enum ShipmentStatus {
  PREPAIRING = 'prepairing',
  TRANSPORTING = 'transporting',
  COMPLETE = 'complete',
  FAILURE = 'failure',
}

export enum OrderStatus {
  PROCESSING = 'processing',
  REQUIRE_RETURN = 'require cancel',
  COMPLETE = 'complete',
  CANCEL = 'cancel',
  RETURNED = 'returned',
}

export enum LoginMethod {
  EMAIL = 'email',
  BOTH = 'both',
}

export enum PhoneOs {
  ANDROID = 'android',
  IOS = 'ios',
  WINDOWN_PHONE = 'window phone',
  BLACKBERRY = 'blackberry',
}
