import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export const API_URL = 'http://localhost:1235';
@Injectable({
  providedIn: 'root'
})
export class PhoneNumberService {

  constructor(private http: HttpClient) { }

  public submit(session:String, phone:String)
  {
    //http://localhost:1235/phone_numbers/submit/session/praveen/phone/9878765423
    return this.http.get(API_URL+'/phone_numbers/submit/session/'+session+'/phone/'+phone);
  }

  public retrievePageData(session:String, page:number, size:number)
  {
    ///session/{session_id}/page/{page_no}/size/{size}
    return this.http.get(API_URL+'/phone_numbers/session/'+session+'/page/'+page+'/size/'+size)
  }
}
