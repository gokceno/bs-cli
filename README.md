bs-cli
=======

BeforeSunset time tracker CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/bs-cli.svg)](https://npmjs.org/package/,bs-cli)
[![Downloads/week](https://img.shields.io/npm/dw/bs-cli.svg)](https://npmjs.org/package/,bs-cli)
[![License](https://img.shields.io/npm/l/bs-cli.svg)](https://github.com/gokceno/,bs-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g bs-cli
$ bs COMMAND
running command...
$ bs (-v|--version|version)
bs-cli/0.0.2 darwin-arm64 node-v16.4.0
$ bs --help [COMMAND]
USAGE
  $ bs COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`bs help [COMMAND]`](#bs-help-command)
* [`bs projects:list`](#bs-projectslist)
* [`bs time:log`](#bs-timelog)

## `bs help [COMMAND]`

display help for bs

```
USAGE
  $ bs help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.3/src/commands/help.ts)_

## `bs projects:list`

Lists the projects

```
USAGE
  $ bs projects:list

OPTIONS
  -c, --client=client  Client id
```

_See code: [src/commands/projects/list.ts](https://github.com/gokceno/bs-cli/blob/v0.0.2/src/commands/projects/list.ts)_

## `bs time:log`

Logs time

```
USAGE
  $ bs time:log

OPTIONS
  -d, --description=description  Description
  -m, --duration=duration        Duration in minutes
  -p, --project=project          Project
  -t, --task=task                Task
```

_See code: [src/commands/time/log.ts](https://github.com/gokceno/bs-cli/blob/v0.0.2/src/commands/time/log.ts)_
<!-- commandsstop -->
