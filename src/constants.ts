import {getInput} from '@actions/core';
import {PermissionFlagsBits} from 'discord-api-types/v10';

export const MANAGE_ROLES = Number(PermissionFlagsBits.ManageRoles);

export const OPTIONS = {
  appToken: getInput('app-token', {required: true}),
  guildID: getInput('guild-id', {required: true}),
  roleID: getInput('role-id', {required: true}),
  roleFormat: getInput('role-format', {required: false}) ?? 'COTD - %n'
  // &s - Color name (e.g. "COTD - Red")
  // &h - Color hex (e.g. "COTD - #FF0000")
};
