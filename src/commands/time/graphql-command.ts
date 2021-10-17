import {Command} from '@oclif/command'
import jwtDecode, { JwtPayload } from 'jwt-decode';

require('dotenv').config()

export class GraphQLCommand extends Command {

  static flags = {
  }

  private axiosParams = {
    url: process.env.BS_API_URL,
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + process.env.BS_AUTH_TOKEN
    },
  }

  private getAccountUserId() {
    let decoded = jwtDecode<JwtPayload>(process.env.BS_AUTH_TOKEN);
    return decoded['https://hasura.io/jwt/claims']['x-hasura-account-user-id'];
  }

}