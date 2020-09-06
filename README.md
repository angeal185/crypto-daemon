# crypto-daemon

nodejs auto encrypt and decrypt file daemon base

* un-encrypted files added to the encrypt folder are encrypted to the data dir.
* encrypted files added to the decrypt folder are decrypted to the data dir.
* originals are automatically deleted upon successful task completion.
* process config from within `./daemon/config.json`.
* `config.working_dir` is absolute or relative to crypto-demon dir.
* working dir must contain data, encrypt and decrypt folders.
* daemon code to be added to `./index.js` or can be kept as a base process.
