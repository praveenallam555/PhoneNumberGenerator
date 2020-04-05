import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PhoneNumberService } from './services/phone-number.service';
import { Response} from './models/response.model';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  phoneForm: FormGroup;
  
  submitted:Boolean = false;
  loading:Boolean = false;
  showPhoneNumbers:Boolean = false;
  
  currentPageNumber:number=1;
  currentPhoneNumber:String='';
  currentSession:String;

  totalPages:number=0;
  totalNumberOfRecords=0;
  
  phones:String[]=[];
  
  tempMessage:String='';
  serverError:Boolean = false;
  serverErrorMessage:String;
  pageSize:number = 50;

  constructor(private formBuilder: FormBuilder, private phoneNumberServie:PhoneNumberService) {

   }

  //ignore characters
  keyPress(event: any) 
  {
    const pattern = /[0-9\+\-\ ]/;
    let inputChar = String.fromCharCode(event.charCode);
    if (event.keyCode != 8 && !pattern.test(inputChar)) 
    {
      event.preventDefault();
    }
  }

  ngOnInit() 
  {
    this.phoneForm = this.formBuilder.group({
      phonenumber: ['', [Validators.required,
      Validators.pattern("^[0-9]*$"),
      AgeValidator]]
    });
  }

  resetToDefaults()
  {
    this.currentPageNumber =1;
    this.totalNumberOfRecords=0;
    this.submitted = true;
    this.showPhoneNumbers = false;
    this.serverError = false;
    this.serverErrorMessage = null;
    this.phoneForm.reset();
    this.phones = [];
    this.loading = false;
    this.currentPhoneNumber='';
  }

  get f() { return this.phoneForm.controls; }

  incrementPage()
  {
    this.currentPageNumber++;
    this.getPageData();
  }

  decrementPage()
  {
    this.currentPageNumber--;
    this.getPageData();
  }
  
  goToPage(pageNumber:number)
  {
    if(pageNumber>0 && pageNumber<=this.totalPages)
    {
      this.tempMessage = 'Page Number set to: '+pageNumber;
      this.currentPageNumber = pageNumber;
      this.getPageData();
    } 
    else{
      this.tempMessage = 'Page Number should be less than total pages: '+this.totalPages;
      setTimeout(x=>{
        this.tempMessage = '';
      },5000);
    } 
  }

  updatePageSize(pageSize:number)
  {
    
    if(pageSize > this.totalNumberOfRecords)
    {
      this.tempMessage = 'Page Size should be less than total records: '+this.totalNumberOfRecords;
    }
    else{
      this.tempMessage = 'Page Size set to '+pageSize;
      this.pageSize = pageSize;
      this.getPageData();
    }
    setTimeout(x=>{
      this.tempMessage = '';
    },5000);
  }

  onSubmit() {
    let sessionString = this.getUniqueString(16);
    console.log(sessionString);
    // stop here if form is invalid
    if (this.phoneForm.invalid) {
      console.log('invalid')
      return;
    }
    this.loading = true;
    let phoneNumber =this.phoneForm.get('phonenumber').value; 
    this.phoneNumberServie.submit(sessionString,phoneNumber)
    .subscribe((response:Response)=>{
      if(response.success)
      {
        this.currentSession= response.data;
        this.resetToDefaults();
        this.currentPhoneNumber = phoneNumber;
      }
      else{
        this.serverError = true;
        this.serverErrorMessage = response.data;
      }
    },
    (error)=>{
      this.serverError = true;
      this.serverErrorMessage = error;
    },()=>{
      this.loading = false;
    });

  }

  getPageData()
  {
    this.loading=true;
    this.showPhoneNumbers = true;
    this.phoneNumberServie.retrievePageData(this.currentSession, this.currentPageNumber-1, this.pageSize)
    .subscribe((response:Response)=>{
      if(response.success)
      {
        this.phones = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalNumberOfRecords = response.data.totalElements;
      }
      else{
        this.serverError= true;
        this.serverErrorMessage = response.data; 
      }
    },
    (error)=>{
      this.serverError= true;
      this.serverErrorMessage = error; 
    },()=>{
      this.loading = false;
    });
  }

  getUniqueString(length) 
  {
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
  }

}

function AgeValidator(control: AbstractControl): { [key: string]: boolean } | null 
{
  if (control.value && (control.value.length == 7 || control.value.length ==10)) {
    return null;
  }
  return { 'phoneNumberLength': true };
}
