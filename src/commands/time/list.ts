import {GraphQLCommand} from './graphql-command'
import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import axios from 'axios'
import * as inquirer from 'inquirer'

export class ListCommand extends GraphQLCommand {
  static description = 'Logs time'

  async run() {

    const dayjs = require('dayjs')
    
    const {flags} = this.parse(ListCommand)
    
    const {data: projects} = await axios({
      ...this.axiosParams,
      data: {
        query: `
        query Times($startedAt: timestamptz!, $endedAt: timestamptz!, $accountUserId: uuid) {
          projects_users_times(where: {onDate: {_gte: $startedAt, _lt: $endedAt}, projectsUser: {accountsUser: {id: {_eq: $accountUserId}}}}, order_by: {createdAt: asc}) {
            onDate
            duration
            notes
            projectsTask {
              accountsTask {
                taskTitle
              }
              project {
                projectName
              }
            }
          }
        }
        `,
        variables: {
          "startedAt": dayjs().format('YYYY-MM-DD[T00:00:00Z]'),
          "endedAt": dayjs().format('YYYY-MM-DD[T23:59:59Z]'),
          "accountUserId": this.getAccountUserId()
        }
      }
    })

    cli.table(projects.data.projects_users_times, {
      'Project Name': {
        minWidth: '30',
        get: row => row.projectsTask.project.projectName
      },
      'Task': {
        minWidth: '30',
        get: row => row.projectsTask.accountsTask.taskTitle
      },
      'Duration': {
        minWidth: '10',
        get: row => `${(row.duration-(row.duration%60))/60}:${row.duration%60}`
      }
    })
  }
}