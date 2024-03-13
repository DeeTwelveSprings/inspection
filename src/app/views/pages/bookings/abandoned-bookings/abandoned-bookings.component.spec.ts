import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbandonedBookingsComponent } from './abandoned-bookings.component';

describe('AbandonedBookingsComponent', () => {
  let component: AbandonedBookingsComponent;
  let fixture: ComponentFixture<AbandonedBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbandonedBookingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbandonedBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
