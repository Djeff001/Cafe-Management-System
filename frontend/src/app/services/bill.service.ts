import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BillService {
  url = environment.apiUrl;
  constructor(private httpClient: HttpClient) {}

  generateReport(data: any) {
    return this.httpClient.post(this.url + '/bill/generateReport', data);
  }

  getPdf(data: any) {
    return this.httpClient.post(this.url + '/bill/getPdf', data);
  }

  getBills() {
    return this.httpClient.get(this.url + '/bill/getBills');
  }

  delete(id: any) {
    return this.httpClient.delete(this.url + '/bill/delete/' + id);
  }
}
