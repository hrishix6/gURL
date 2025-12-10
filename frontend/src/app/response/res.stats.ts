import { Component, HostBinding, input } from '@angular/core';
import { BytesPipe } from '../../common/pipes/bytes.pipe';
import { ResStatsType } from '../models';

@Component({
  selector: `app-res-stats`,
  template: `
    @if(stats()?.success){
    <div class="badge badge-outline badge-success">{{ stats()!.statusText }}</div>
    } @else {
    <div class="badge badge-outline badge-error">{{ stats()!.statusText }}</div>
    }
    <div class="badge badge-soft badge-info">{{ stats()!.time }} ms</div>
    <div class="badge badge-soft badge-info">
      {{ stats()!.size | bytes }}
    </div>
  `,
  imports: [BytesPipe],
})
export class ResStats {
  @HostBinding('class')
  dc = 'flex gap-2';
  stats = input.required<ResStatsType>();
}
