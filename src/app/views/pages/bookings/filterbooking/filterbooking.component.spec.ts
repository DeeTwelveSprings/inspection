import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterbookingComponent } from './filterbooking.component';

describe('FilterbookingComponent', () => {
  let component: FilterbookingComponent;
  let fixture: ComponentFixture<FilterbookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterbookingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterbookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
