import * as core from '@actions/core';
import { Collection } from '@discordjs/collection';

import { MANAGE_ROLES, OPTIONS } from './constants';
import { ColorStruct, RoleCollection } from './types';
import { hasPermissionFor, resolvePermissionsOf, wrapDuration } from './util';
import RequestHandler from './request-handler';

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

const randomHexInt = (): number => Math.floor(Math.random() * 16777215);

async function run(): Promise<void> {
  try {
    const { appToken, guildID, roleID, roleFormat } = OPTIONS;
    const timer = wrapDuration();

    const handler = new RequestHandler(appToken);

    // Can only throw exceptions, user is guaranteed to exist if token is valid
    const user = await handler.getUser();

    if (!user.bot) throw new Error('Authenticated user is not a bot');

    const guild = await handler.getGuild(guildID);

    if (!guild.roles.length) throw new Error('No roles found.');

    const roles: RoleCollection = new Collection(
      guild.roles.map(r => [r.id, r])
    );

    const target = roles.get(roleID);

    if (!target) throw new Error('Role not found.');

    const member = await handler.getMember(guildID, user.id);
    // No failover necessary, guild was found and user is authenticated

    const userRoles = roles.filter(r => member.roles.includes(r.id));
    const permissions = resolvePermissionsOf(userRoles);
    if (!hasPermissionFor(MANAGE_ROLES, permissions))
      throw new Error('User does not have permission to manage roles.');

    const highestRole = userRoles
      .sort((a, b) => b.position - a.position)
      .first();

    if (guild.owner || (highestRole && highestRole.position <= target.position))
      throw new Error('User does not have permission to manage this role.');

    const colorCode = randomHexInt();
    const colorHex = colorCode.toString(16);

    const colorDataRes = await fetch(
      `https://www.thecolorapi.com/id?hex=${colorHex}`
    );
    const colorData: ColorStruct = await colorDataRes.json();

    const newRole = await handler.modifyRole(guildID, roleID, {
      color: colorCode,
      name: roleFormat
        .replace('&s', colorData.name.value)
        .replace('&h', colorData.hex.clean)
    });
    const duration = timer();

    core.info(`Role ${newRole.name} has been updated.`);
    core.info(`Old data: ${target.name} | ${target.color}`);
    core.info(`New data: ${newRole.name} | ${newRole.color}`);

    core.info(`Took ${duration} to complete.`);

    core.setOutput('color-int', newRole.color);
    core.setOutput('color-hex', newRole.color.toString(16));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
