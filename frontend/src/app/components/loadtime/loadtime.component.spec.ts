import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadtimeComponent } from './loadtime.component';

describe('LoadtimeComponent', () => {
  let component: LoadtimeComponent;
  let fixture: ComponentFixture<LoadtimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadtimeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LoadtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
