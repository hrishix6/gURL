import { Component, OnInit, signal } from '@angular/core';
import {Greet2} from '../../wailsjs/go/main/App'
import { Tab, TabItem } from '../components/tab/tab';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [Tab]
})
export class App  {

  requestFormTabs: TabItem[] = [
    {
      id: '1',
      Name: "Headers"
    },
    {
      id: '2',
      Name: "Query Params"
    },
    {
      id: '3',
      Name: "Body"
    },
    {
      id: '4',
      Name: "Auth"
    }
  ]

  responseTabs: TabItem[] = [
    {
      id: '1',
      Name: "Response"
    },
    {
      id: '2',
      Name: "Headers"
    },
  ]

}
