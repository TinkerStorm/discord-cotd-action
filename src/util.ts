import ms from 'ms';
import { RoleCollection } from './types';

export const resolvePermissionsOf = (roles: RoleCollection): number =>
  roles.reduce((acc, role) => acc | Number(role.permissions), 0);

export const hasPermissionFor = (flag: number, permissions: number): boolean =>
  (permissions & flag) === flag;

export function getDuration(start: number): string {
  const duration = performance.now() - start;
  return `${duration.toFixed(2)}ms`;
}

export function wrapDuration(): () => string {
  const start = performance.now();
  return () => {
    const end = performance.now();
    return ms(end - start);
  };
}

export const randomHexInt = (): number => Math.floor(Math.random() * 0xffffff);
