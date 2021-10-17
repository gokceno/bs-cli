import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import axios from 'axios'
import * as inquirer from 'inquirer'

require('dotenv').config()

export class ListCommand extends Command {
  static description = 'Lists the projects'
  static flags = {
    client: flags.string({char: 'c', description: 'Client id'})
  }
  async run() {

    const {flags} = this.parse(ListCommand)

    const {data: projects} = await axios({
      url: process.env.BS_API_URL,
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + process.env.BS_AUTH_TOKEN
      },
      data: {
        query: `
        query ProjectsQuery {
          projects {
            projectName
            id
          }
        }
        `
      }
    })

    cli.table(projects.data.projects, {
      projectName: {},
      id: {}
    })

  }
}

