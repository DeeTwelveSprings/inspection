import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbandonedBookingDetailComponent } from './abandoned-booking-detail.component';

describe('AbandonedBookingDetailComponent', () => {
  let component: AbandonedBookingDetailComponent;
  let fixture: ComponentFixture<AbandonedBookingDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AbandonedBookingDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbandonedBookingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
