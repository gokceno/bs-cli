import {Command, flags} from '@oclif/command'
import {cli} from 'cli-ux'
import axios from 'axios'
import * as inquirer from 'inquirer'
import jwtDecode, { JwtPayload } from 'jwt-decode';

require('dotenv').config()

export class LogCommand extends Command {
  static description = 'Logs time'

  static flags = {
    project: flags.string({char: 'p', description: 'Project'}),
    task: flags.string({char: 't', description: 'Task'}),
    duration: flags.string({char: 'm', description: 'Duration in minutes'}),
    description: flags.string({char: 'd', description: 'Description'})
  }

  private getAccountUserId() {
    let decoded = jwtDecode<JwtPayload>(process.env.BS_AUTH_TOKEN);
    return decoded['https://hasura.io/jwt/claims']['x-hasura-account-user-id'];
  }

  private getProjectUserId(projectId:string, accountUserId:string) {
    return axios({
      url: process.env.BS_API_URL,
      method: 'post',
      headers: {
        'Authorization': 'Bearer ' + process.env.BS_AUTH_TOKEN
      },
      data: {
        query: `
          query ProjectUsersQuery($accountUserId:uuid, $projectId:uuid) {
            projects_users(where: {accountUserId: {_eq: $accountUserId}, projectId: {_eq: $projectId}}) {
              id
            }
          }
        `,
        variables: {
          accountUserId: accountUserId,
          projectId: projectId
        }
      }
    }).then(response => {
      return response.data.data.projects_users[0].id
    })
  }

  private axiosParams = {
    url: process.env.BS_API_URL,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + process.env.BS_AUTH_TOKEN
    },
  }

  async run() {

    const dayjs = require('dayjs')
    
    const {flags} = this.parse(LogCommand)

    let project = flags.project
    let task = flags.task
    let duration = flags.duration
    let description = flags.description

    if(!project) {
      let responses: any = await inquirer.prompt([{ 
        name: 'Project',
        message: 'Select a project',
        type: 'list',
        choices: () => {
          return axios({
            ...this.axiosParams,
            data: {
              query: `
              query ProjectsQuery($accountUserId: uuid) {
                 accounts_users(where: {id: {_eq: $accountUserId}}) {
                  account {
                    projects(order_by: {accountsClient: {clientName: asc}}) {
                      id
                      projectName
                      accountsClient {
                        clientName
                      }
                    }
                  }
                }
              }
              `,
              variables: {
                accountUserId: this.getAccountUserId()
              }
            }
          }).then(response => {
            return response.data.data.accounts_users[0].account.projects.map(row => {
              return {
                name: `${row.projectName} (${row.accountsClient.clientName})`, 
                value: row.id
              }
            })
          })
        }
      }])
      project = responses.Project
    }

    if(!task) {
      let responses: any = await inquirer.prompt([{ 
        name: 'Task',
        message: 'Select a task',
        type: 'list',
        choices: () => {
          return axios({
            ...this.axiosParams,
            data: {
              query: `
              query TasksQuery($projectId: uuid) {
                projects(where: {id: {_eq: $projectId}}) {
                  projectsTasks(order_by: {accountsTask: {taskTitle: asc}}) {
                    id
                    accountsTask {
                      taskTitle
                    }
                  }
                }
              }
              `,
              variables: {
                projectId: project
              }
    
            }
          }).then(response => {
            return response.data.data.projects[0].projectsTasks.map(row => {
              return {name: row.accountsTask.taskTitle, value: row.id}
            })
          })
        }
      }])
      task = responses.Task
    }

    if(!duration) {
      duration = await cli.prompt('Type duration in minutes')
    }

    if(!description) {
      description = await cli.prompt('Type description')
    }

    axios({
      ...this.axiosParams,
      data: {
        query: `
        mutation MyMutation($duration:float8, $notes:String, $onDate:timestamptz, $projectTaskId:uuid, $projectUserId:uuid) {
          insert_projects_users_times(objects: {
            duration: $duration, 
            notes: $notes, 
            onDate: $onDate, 
            projectTaskId: $projectTaskId, 
            projectUserId: $projectUserId
          }) {
            affected_rows
          }
        }
        `,
        variables: {
          duration: duration,
          notes: description,
          onDate: dayjs().format(),
          projectTaskId: task,
          projectUserId: await this.getProjectUserId(project, this.getAccountUserId())
        }
      }
    }).then(response => {
      if(!response.data.errors) {
        this.log(`You have logged ${(duration-(duration%60))/60} hour(s) and ${duration%60} minute(s)`)
      }
      else {
        this.log(response.data.errors)
      }
    })
  }
}