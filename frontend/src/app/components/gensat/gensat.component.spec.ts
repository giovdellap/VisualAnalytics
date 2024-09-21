import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GensatComponent } from './gensat.component';

describe('GensatComponent', () => {
  let component: GensatComponent;
  let fixture: ComponentFixture<GensatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GensatComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GensatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
