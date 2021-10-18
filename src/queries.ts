export const USERS_TIMES = `
query Times($startedAt: timestamptz!, $endedAt: timestamptz!, $accountUserId: uuid) {
  projects_users_times(where: {onDate: {_gte: $startedAt, _lt: $endedAt}, projectsUser: {accountsUser: {id: {_eq: $accountUserId}}}}, order_by: {createdAt: asc}) {
    onDate
    duration
    notes
    id
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
`