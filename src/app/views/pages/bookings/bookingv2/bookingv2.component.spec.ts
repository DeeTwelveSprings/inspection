import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bookingv2Component } from './bookingv2.component';

describe('Bookingv2Component', () => {
  let component: Bookingv2Component;
  let fixture: ComponentFixture<Bookingv2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Bookingv2Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Bookingv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
