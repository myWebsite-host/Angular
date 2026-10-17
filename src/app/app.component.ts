// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.css'
// })
// export class AppComponent {
//   title = 'org-directory';
// }
import { Component } from '@angular/core';
import { OrgListComponent } from './components/org-list/org-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [OrgListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}