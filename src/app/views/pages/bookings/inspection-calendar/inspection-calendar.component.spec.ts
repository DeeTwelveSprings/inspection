import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionCalendarComponent } from './inspection-calendar.component';

describe('InspectionCalendarComponent', () => {
  let component: InspectionCalendarComponent;
  let fixture: ComponentFixture<InspectionCalendarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InspectionCalendarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionCalendarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
