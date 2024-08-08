import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { Categories } from '../../shared/models/category.model';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from "../../shared/components/overview/overview.component";

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, OverviewComponent],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss',
})
export class IndexComponent implements OnInit {
  categories: Categories[] = [{ title: '', image: '' }];

  ngOnInit(): void {
    this.categories = [
      { title: 'Web', image: 'http://' },
      { title: 'Mobile', image: 'http://' },
      { title: 'Backend', image: 'http://' },
      { title: 'Data', image: 'http://' },
    ];
  }
}
