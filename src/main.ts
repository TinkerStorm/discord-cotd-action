import * as core from '@actions/core';
import {
  APIUser,
  APIGuild,
  APIGuildMember,
  Routes,
  APIRole,
  RESTPostAPIGuildRoleJSONBody
} from 'discord-api-types/v10';
import {MANAGE_ROLES, OPTIONS} from './constants';
import {ColorStruct} from './types';
import {hasPermission as hasPermissionFor, resolvePermissionsOf} from './util';

// Check if Token User...
// * has valid access
// * is bot user
// Request:
// * Guild Data (/api/v10/guilds/:guild)
//   > Escape null / Error Code 404 = no access
// * Member Data (/api/v10/guilds/:guild/members/:member)
// Check if Token User...
// * has permissions for MANAGE_ROLES for the guild (not a channel overwrite)
// * is higher on the role list than the target role {b.position - a.position}
// > MUST be higher, not below and certainly not the highest role they have

const makeRequest = async <T>(uri: string, token: string): Promise<T> => {
  const res = await fetch(uri, {
    headers: {
      Authorization: `Bot ${token}`
    }
  });
  return res.json();
};

const randomHexInt = (): number => Math.floor(Math.random() * 16777215);

async function run(): Promise<void> {
  try {
    const {appToken, guildID, roleID, roleFormat} = OPTIONS;

    const user: APIUser = await makeRequest(Routes.user(), appToken);
    if (!user) throw new Error('User not found.');

    const guild: APIGuild = await makeRequest(Routes.guild(guildID), appToken);
    if (!guild) throw new Error('Guild not found / User not authenticated.');
    if (!guild.roles.length) throw new Error('No roles found.');
    if (!guild.roles.map(r => r.id).includes(roleID))
      throw new Error('Role not found.');

    const member: APIGuildMember = await makeRequest(
      Routes.guildMember(guildID, user.id),
      appToken
    );

    if (!member) throw new Error('Member not found / User not authenticated.');

    const permissions = resolvePermissionsOf(member, guild.roles);
    if (!hasPermissionFor(MANAGE_ROLES, permissions))
      throw new Error('User does not have permission to manage roles.');

    const mappedRoles: Record<string, APIRole> = {};
    for (const role of guild.roles) {
      mappedRoles[role.id] = role;
    }

    const mappedUserRoles: Record<string, APIRole> = {};
    for (const memberRoleID of member.roles) {
      mappedUserRoles[memberRoleID] = mappedRoles[memberRoleID];
    }

    const targetRole = mappedRoles[roleID];
    if (
      guild.owner_id !== user.id &&
      Object.values(mappedUserRoles).some(
        r => r.position <= targetRole.position
      )
    )
      throw new Error('User does not have permission to manage this role.');

    const colorCode = randomHexInt();
    const colorHex = colorCode.toString(16);

    const colorDataRes = await fetch(
      `https://www.thecolorapi.com/id?hex=${colorHex}`
    );
    const colorData: ColorStruct = await colorDataRes.json();

    const newRoleData: RESTPostAPIGuildRoleJSONBody = {
      color: colorCode,
      name: roleFormat
        .replace('&s', colorData.name.value)
        .replace('&h', colorData.hex.clean)
    };

    const newRoleRes = await fetch(Routes.guildRole(guildID, roleID), {
      body: JSON.stringify(newRoleData),
      headers: {
        Authorization: `Bot ${appToken}`
      }
    });
    const newRole: APIRole = await newRoleRes.json();

    core.setOutput('color-int', newRole.color);
    core.setOutput('color-hex', newRole.color.toString(16));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
    if (typeof error === 'string') core.setFailed(error);
  }
}

run();
