# Kibana Hide Exists

### Issue

In Kibana 8.7.0, in [this PR](https://github.com/elastic/kibana/pull/147216) we removed a toggle that previously allowed the dashboard author to hide the ability to make an `exists` query. Now it is not possible to hide this setting

### Workaround

This small node program is a workaround for that issue. It takes elasticsearch credentials, and sets the hideExists key to true for all options list Controls on all dashboards.

### How to Run

`yarn install`
`node index.js`

Enter in your elasticsearch endpoint, username, and password.

> **Note**
This script requires a user with a role that has `allow_restricted_indices: true`. You can follow the instructions [here](https://www.elastic.co/guide/en/kibana/8.7/resolve-migrations-failures.html#_corrupt_saved_objects) to create this type of user.
