# API

Some useless API endpoints.

[![LICENSE](https://img.shields.io/github/license/cubercsl/api)](LICENSE)

## [Codeforces Rating Badge](api/codeforces.ts)

**GET** `https://api.cubercsl.site/api/codeforces`


| Params  | Type     | Required | Description                                   |
| ------- | -------  | :------: | :-------------------------------------------: |
| `user`  | _string_ |    ✔    | Codeforces handle                             |
| `style` | _string_ |    ❌   | [Shields.io](https://shields.io/) badge style |

**Example** `https://api.cubercsl.site/api/codeforces?user=tourist&style=for-the-badge`

**Respose**

![](https://api.cubercsl.site/api/codeforces?user=tourist&style=for-the-badge)

The response is cached for 24 hours.
