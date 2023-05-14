# Cubercsl's API

[![LICENSE](https://img.shields.io/github/license/cubercsl/api)](LICENSE)

Some useless APIs for my personal use.

## Codeforces Rating Badge API



**GET** `https://api.cubercsl.site/codeforces/{user}`

| Params  | Type     | Required | Description                                   |
| ------- | -------  | :------: | :-------------------------------------------: |
| `user`  | _string_ |    ✔    | Codeforces handle                             |
| `style` | _string_ |    ❌   | [Shields.io](https://shields.io/) badge style |

**Example** `https://api.cubercsl.site/codeforces?user=tourist&style=for-the-badge`

**Respose**

![](https://api.cubercsl.site/codeforces?user=tourist&style=for-the-badge)

The response is cached for 24 hours.

> **Note**
> The legacy API endpoint (`/api/codeforces`) is deprecated and will be removed in the future.
