export const FLAG = 'admin'

export function withFlag(flag, data) {
  return {
    flag,
    ...data
  }
}
