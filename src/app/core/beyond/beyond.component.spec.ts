import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeyondComponent } from './beyond.component';

describe('BeyondComponent', () => {
  let component: BeyondComponent;
  let fixture: ComponentFixture<BeyondComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BeyondComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BeyondComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
