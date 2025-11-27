import { NgClass } from '@angular/common';
import { Component, signal, input, OnInit } from '@angular/core';


export interface TabItem {
    id : string;
    Name: string;
}

@Component({
  selector: 'app-tab',
  templateUrl: './tab.html',
  imports: [NgClass]
})
export class Tab implements OnInit {
    defaultActive = input<string>()
    tabs = input.required<TabItem[]>();
    active = signal<string>("")


    ngOnInit(): void {

        const defaultActiveVal =  this.defaultActive()

        if(defaultActiveVal)
        {
            this.active.set(defaultActiveVal)
        }
        else {
            const firstTabId = this.tabs()[0].id;
            this.active.set(firstTabId)
        }
    }

    handleClick(id: string) {
        this.active.set(id);
    }

}
