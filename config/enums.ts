export enum EnumPaths {
  REGISTER = 'register',
  LOGIN = 'login',
  LOGOUT = 'logout',
  REFRESH = 'refresh',
}

export enum EnumAdminPaths {
  GARAGES = 'garages',
  GARAGE_ADMINS = 'garage_admins',
}

export enum EnumUserRole {
  USER = 'user',
  GARAGE_ADMIN = 'garage_admin',
  SUPER_ADMIN = 'super_admin',
}

export enum EnumHttpStatus {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}

export enum EnumHttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

export enum EnumLogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}