import { Component, input } from '@angular/core';

@Component({
  selector: 'rez-not-found',
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
    title = input<string>('Nothing was ever here');
    message = input<string>('You are imagining it.');
}
