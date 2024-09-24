import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ResolutionService } from './services/resolution.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    RouterLink,
    FormsModule, ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    CommonModule,
    MatIconModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  title = 'frontend';

  subrowEmitter = new BehaviorSubject<boolean>(false)
  subrowObservable: Observable<boolean>

  optionControl = new FormControl()
  options: string[] = ['1920x1080', '2560x1440']

  constructor(
    private router: Router,
    private resolution: ResolutionService
  ) {
    this.subrowObservable = this.subrowEmitter.asObservable()
  }

  ngOnInit(): void {
    this.optionControl.setValue(this.options[0])
    this.optionControl.valueChanges.subscribe((res: string) => {
      this.resolution.setResolution(res)
    })
  }

  openSubRow() {
    this.subrowEmitter.next(true)
  }

  closeSubRow() {
    this.subrowEmitter.next(false)
  }

  onClickPath(path: string) {
    this.closeSubRow()
    this.router.navigate([path]);
  }
}
