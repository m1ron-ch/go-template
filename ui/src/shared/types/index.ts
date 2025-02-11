export enum AccountStatus {
  Active = 1,
  Blocked = 2,
  Deleted = 3,
}

export enum UserRole {
  Admin = 2,
  SuperAdmin = 1,
}

export type UserType = {
  f_name: string
  id: number
  ipv4: string
  l_name: string
  last_login: string
  login: string
  login_attempts: number
  m_name: string
  password: string
  refresh_token: string
  regestration_date: string
  role_id: UserRole
  status: AccountStatus
  token: string
  token_creation: string
}
