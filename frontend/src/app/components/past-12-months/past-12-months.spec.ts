import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Past12Months } from './past-12-months';

describe('Past12Months', () => {
  let component: Past12Months;
  let fixture: ComponentFixture<Past12Months>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Past12Months],
    }).compileComponents();

    fixture = TestBed.createComponent(Past12Months);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
