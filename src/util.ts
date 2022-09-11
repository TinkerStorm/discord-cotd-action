import {APIGuildMember, APIRole} from 'discord-api-types/v10';

export function resolvePermissionsOf(
  member: APIGuildMember,
  roles: APIRole[]
): number {
  const {roles: memberRoles} = member;
  let permissions = 0;
  for (const roleID of memberRoles) {
    const role = roles.find(({id}) => id === roleID);
    if (role) permissions |= Number(role.permissions);
  }
  return permissions;
}

export function hasPermission(flag: number, permissions: number): boolean {
  flag = Number(flag);
  return (permissions & flag) === flag;
}
