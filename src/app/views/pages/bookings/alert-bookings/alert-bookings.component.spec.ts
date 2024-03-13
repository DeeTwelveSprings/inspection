import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertBookingsComponent } from './alert-bookings.component';

describe('AlertBookingsComponent', () => {
  let component: AlertBookingsComponent;
  let fixture: ComponentFixture<AlertBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AlertBookingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
