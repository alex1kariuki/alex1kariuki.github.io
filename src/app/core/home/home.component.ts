import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  skills: any;
  constructor() { }

  ngOnInit(): void {
    this.skills = [
      {title:'Web'},
      {title:'Mobile'},
      {title:'Web3'},
      {title:'Backend'},
    ]
  }

}
