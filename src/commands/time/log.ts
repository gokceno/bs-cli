import {GraphQLCommand} from './graphql-command'
import {flags} from '@oclif/command'
import {cli} from 'cli-ux'
import axios from 'axios'
import * as inquirer from 'inquirer'

export class LogCommand extends GraphQLCommand {
  static description = 'Logs time'

  static flags = {
    project: flags.string({char: 'p', description: 'Project'}),
    task: flags.string({char: 't', description: 'Task'}),
    duration: flags.string({char: 'm', description: 'Duration in minutes'}),
    description: flags.string({char: 'd', description: 'Description'})
  }

  private getProjectUserId(projectId:string, accountUserId:string) {
    return axios({
      ...this.axiosParams,
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
      if(!response.data.errors) {
        return response.data.data.projects_users[0].id
      }
      else {
        throw new Error(response.data.errors[0].message);
      }
    })
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
            if(!response.data.errors) {
              return response.data.data.accounts_users[0].account.projects.map(row => {
                return {
                  name: `${row.projectName} (${row.accountsClient.clientName})`, 
                  value: row.id
                }
              })
            }
            else {
              throw new Error(response.data.errors[0].message);
            }
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
            if(!response.data.errors) {
              return response.data.data.projects[0].projectsTasks.map(row => {
                return {name: row.accountsTask.taskTitle, value: row.id}
              })
            }
            else {
              throw new Error(response.data.errors[0].message);
            }
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
    if(!isNaN(+duration)) {
      axios({
        ...this.axiosParams,
        data: {
          // TODO: Mutation should be named in a more meaningful way
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
          throw new Error(response.data.errors[0].message);
        }
      })
    }
    else {
      throw new Error('Please enter duration in minutes, only numeric values are accepted.');
    }
  }
}