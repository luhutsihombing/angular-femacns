import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProcessedAssignment } from '../_model/assignment.model';


@Injectable()
export class AssignmentService {

  constructor(public http: HttpClient) { }

  getTemplate(): Observable<string> {
    return this.http.get('', { responseType: 'text' });
  }

  getProcessedAssignment(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  processAssignment(file: File): Observable<ProcessedAssignment> {
    return this.http.post<ProcessedAssignment>('', file);
  }

}
