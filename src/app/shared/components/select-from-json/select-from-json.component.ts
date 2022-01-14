import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-select-from-json',
  templateUrl: './select-from-json.component.html',
  styleUrls: ['./select-from-json.component.css']
})
export class SelectFromJsonComponent implements OnInit {
  @Input() valor: string;

  constructor() { }

  ngOnInit(): void {
  }

}
