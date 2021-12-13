export const USER_ROLE = {
  guest: 'GUEST',
  user: 'USER',
  admin: 'ADMIN',
}

export interface CustomContext {
  token: string | null
  uuid: string
}