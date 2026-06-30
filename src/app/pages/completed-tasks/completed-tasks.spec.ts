import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedTasksComponent } from './completed-tasks';

describe('CompletedTasks', () => {
  let component: CompletedTasksComponent;
  let fixture: ComponentFixture<CompletedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompletedTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompletedTasksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
