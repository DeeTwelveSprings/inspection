import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebBookingsComponent } from './web-bookings.component';

describe('WebBookingsComponent', () => {
  let component: WebBookingsComponent;
  let fixture: ComponentFixture<WebBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WebBookingsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
