import {GraphQLCommand} from './graphql-command'
import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import axios from 'axios'
import * as inquirer from 'inquirer'
import {USERS_TIMES} from '../../queries'

export class RemoveCommand extends GraphQLCommand {
  static description = 'Removes time'

  static flags = {
    projectUserTimeId: flags.string({char: 't', description: 'Time Entry'}),
  }

  async run() {

    const dayjs = require('dayjs')
    
    const {flags} = this.parse(RemoveCommand)

    let projectUserTimeId = flags.projectUserTimeId

    if(!projectUserTimeId) {
      let responses: any = await inquirer.prompt([{ 
        name: 'Time Entry',
        message: 'Select a time entry',
        type: 'list',
        choices: () => {
          return axios({
            ...this.axiosParams,
            data: {
              query: USERS_TIMES,
              variables: {
                startedAt: dayjs().format('YYYY-MM-DD[T00:00:00Z]'),
                endedAt: dayjs().format('YYYY-MM-DD[T23:59:59Z]'),
                accountUserId: this.getAccountUserId()
              }
            }
          }).then(response => {
            if(!response.data.errors) {
              if(response.data.data.projects_users_times.length) {
                return response.data.data.projects_users_times.map(row => {
                  return {
                    name: `${row.projectsTask.project.projectName} (${row.projectsTask.accountsTask.taskTitle}) => ${(row.duration-(row.duration%60))/60}:${row.duration%60<10?'0'+row.duration%60:row.duration%60}`, 
                    value: row.id
                  }
                })
              }
              else {
                // TODO: Error handling burda olmak yerine dışarıda olursa Error() atmak yerine .log ile basılabilir.
                throw new Error('No time logged today.')  
              }
            }
            else {
              throw new Error(response.data.errors[0].message);
            }
          })
        }
      }])
      projectUserTimeId = responses['Time Entry']
    }

    axios({
      ...this.axiosParams,
      data: {
        // TODO: Mutation should be named in a more meaningful way
        query: `
        mutation MyMutation($projectUserTimeId:uuid) {
          delete_projects_users_times(where: {id: {_eq: $projectUserTimeId}}) {
            affected_rows
          }
        }
        `,
        variables: {
          projectUserTimeId: projectUserTimeId,
        }
      }
    }).then(response => {
      if(!response.data.errors) {
        this.log('Time entry removed.')
      }
      else {
        throw new Error(response.data.errors[0].message);
      }
    })

  }
}