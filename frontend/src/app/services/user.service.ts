import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  url = environment.apiUrl;
  constructor(private httpClient:HttpClient) { }

  signup(data:any){
    return this.httpClient.post(this.url+'/user/signup',data)
  }

  login(data:any){
    return this.httpClient.post(this.url+'/user/login',data)
  }

  forgotPassword(data:any){
    return this.httpClient.post(this.url+'/user/forgotPassword',data)
  }

  getUsers(){
    return this.httpClient.get(this.url+'/user/get')
  }

  updateUser(data:any){
    return this.httpClient.patch(this.url+'/user/update', data)
  }

  changePassword(data:any){
    return this.httpClient.patch(this.url+'/user/changePassword', data)
  }
}