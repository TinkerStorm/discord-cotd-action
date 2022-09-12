# discord-cotd-action

An action to randomize the color of a role in Discord each time it is called upon.

## Usage

```yaml
- name: Randomize color of role
  uses: TinkerStorm/discord-cotd-action@main
  with:
    app-token: ${{ secrets.DISCORD_TOKEN }}
    guild-id: "123456789012345678"
    role-id: "123456789012345678"
    # role-format: "COTD - &s"
```

## Inputs (`with.*`)

**All arguments are required unless otherwise specified.**

> **Warning**  
> The application (`app-token`) **must** have...
> - membership for the specified guild (`guild-id`)
> - `MANAGE_ROLES` permission
> - a role higher than the specified (`role-id`)

### `app-token`

The Discord application token. This can be found in the [Discord developer portal (discord.com)](https://discord.com/developer/applications/).

> **Warning**  
> The token should be [stored as a secret (docs.github.com)](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in your repository. Posting it publicly is a security risk, and Discord [will reset it (docs.github.com)](https://docs.github.com/en/code-security/secret-scanning/secret-scanning-patterns#supported-secrets-for-partner-patterns:~:text=Discord-,Discord%20Bot%20Token) if committed to a public repository.

### `guild-id`

The ID of the guild to change the role color in.

### `role-id`

The ID of the role to randomize the color of. This can be found by right-clicking the role in Discord and selecting "Copy ID".

### `role-format`

*This input is optional.*

The format of the role name. The following variables are available:

- `&s` - The color name
- `&h` - The color hex code

## Outputs

### `color-int`

The integer representation of the color that was set.

### `color-hex`

The hexadecimal representation of the color that was set.

## License

This project is licensed under the [MIT License](LICENSE).

## Future

- [ ] Implement a test suite for the action itself, and the functions that it uses.
   > It was originally removed due to the complexity of requiring a request mock, and the lack of documentation on how to do so. I may be able to implement it in the future, but for now, it is not a priority.
- [ ] Implement a way to set a color according to a provided argument (-> `with.color-wheel: #7289DA,...`).
   > Default to first element, if current color is not in provided list.
- [ ] Implement a way to adjust for web safe colors (-> `with.use-web-safe-colors: boolean`).
  - [Avoiding color blindness penalty (stackoverflow#34569332)](https://stackoverflow.com/a/34569332)
  - [Using JavaScript to Adjust Saturation and Brightness (css-tricks.com)](https://css-tricks.com/using-javascript-to-adjust-saturation-and-brightness-of-rgb-colors/)
