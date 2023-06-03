import { debug } from '@actions/core';
import {
  RESTGetAPICurrentUserResult,
  RESTGetAPIGuildMemberResult,
  RESTGetAPIGuildResult,
  RESTPostAPIGuildRoleJSONBody,
  RESTPostAPIGuildRoleResult,
  Routes,
  RouteBases
} from 'discord-api-types/v10';
import fetch, { type RequestInit } from 'node-fetch';

import { wrapDuration } from './util';

export default class RequestHandler {
  constructor(private token: string) {}

  private async request<T extends object>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const path = `${options.method ?? 'GET'} ${url}`;

    debug(`Requesting for ${path}`);
    const timer = wrapDuration();
    const res = await fetch(RouteBases.api + url, {
      ...options,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json',
        Authorization: `Bot ${this.token}`
        // Must always have auth header
      }
    });
    debug(`Request for ${path} took ${timer()}`);
    const data = (await res.json()) as T | { message: string };
    if ('message' in data) throw new Error(data.message);
    // Failover is necessary for handler to fallback on for 4** and 5** error codes

    return data;
  }

  /**
   * @returns The authenticated user
   * @throws {Error} If the user is not found
   */
  async getUser(): Promise<RESTGetAPICurrentUserResult> {
    return this.request(Routes.user());
  }

  /**
   *
   * @param guildID The guild to get the roles from
   * @returns The requested guild entity
   * @throws {Error} If the guild is not found, within the scope of the authenticated user
   */
  async getGuild(guildID: string): Promise<RESTGetAPIGuildResult> {
    return this.request(Routes.guild(guildID));
  }

  /**
   *
   * @param guildID The guild to get the member from
   * @param memberID The member to get
   * @returns The requested member entity
   * @throws {Error} If the member is not found, within the scope of the requested guild
   */
  async getMember(
    guildID: string,
    memberID: string
  ): Promise<RESTGetAPIGuildMemberResult> {
    return this.request(Routes.guildMember(guildID, memberID));
  }

  /**
   *
   * @param guildID The guild to get the roles from
   * @param roleID The role to modify
   * @param options The options to modify the role with
   * @returns
   */
  async modifyRole(
    guildID: string,
    roleID: string,
    options: RESTPostAPIGuildRoleJSONBody
  ): Promise<RESTPostAPIGuildRoleResult> {
    return this.request(Routes.guildRole(guildID, roleID), {
      method: 'PATCH',
      body: JSON.stringify(options)
    });
  }
}
