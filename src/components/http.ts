import { ILifecycle } from './lifecycle'
import axios from 'axios'

export enum HttpMethods {
  post = 'post',
  get = 'get',
}

export interface IFetchParams {
  method: HttpMethods,
  url: string,
  data?: object
}

export interface IHttpClient {
  fetch({method, url, data}: IFetchParams): Promise<{
    statusCode: number,
    body: any,
  }>
}

export class HttpClient implements IHttpClient, ILifecycle {
  private token: string
  private config: any

  private async getToken(): Promise<string> {
    return axios.post<{'token/jwt': string}>(`${this.config.services.auth}/api/services/token`, {
      'auth/service': this.config.service.name,
      'auth/password': this.config.service.password,
    })
    .then((response) => {
      return response.data['token/jwt']
    })
  }

  public async fetch({method, url, data}: IFetchParams): Promise<any> {
    this.token = this.token || await this.getToken()

    return axios({
      method,
      url,
      data,
      headers: {
        Authorization: this.token,
      },
    }).catch((err) => {
      // TODO
      // console. log(err)
      // if (err ...) {
      //   // Refresh token
      //   this.token = null
      //   return this.fetch(params)
      // }
    })
  }

  public start({ config }: any) {
    this.config = config.getConfig()
  }

  public stop() {
    //  NO_OP
  }
}
