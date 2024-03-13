import { Component, OnInit } from '@angular/core';
import { GlobalConstants } from './global-constants';

@Component({
  selector: 'app-root',
  providers: [ GlobalConstants ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'nobleui-angular';

  ngOnInit(): void {}

}
