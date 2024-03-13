import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListInspectorsComponent } from './list-inspectors.component';

describe('ListInspectorsComponent', () => {
  let component: ListInspectorsComponent;
  let fixture: ComponentFixture<ListInspectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListInspectorsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListInspectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
