import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllTasksComponent } from './all-tasks';

describe('AllTasks', () => {
  let component: AllTasksComponent;
  let fixture: ComponentFixture<AllTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AllTasksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
