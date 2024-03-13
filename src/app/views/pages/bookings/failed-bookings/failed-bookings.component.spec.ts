import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FailedBookingsComponent } from './failed-bookings.component';

describe('FailedBookingsComponent', () => {
  let component: FailedBookingsComponent;
  let fixture: ComponentFixture<FailedBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FailedBookingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FailedBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
