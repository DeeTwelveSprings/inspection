import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingAgreementComponent } from './booking-agreement.component';

describe('BookingAgreementComponent', () => {
  let component: BookingAgreementComponent;
  let fixture: ComponentFixture<BookingAgreementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingAgreementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingAgreementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
