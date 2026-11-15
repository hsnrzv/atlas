import { Component, input, output } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';

export interface DestinationOption {
  readonly id: string;
  readonly title: string;
}

/** Chooses the Destination an overview page shows (Waypoints, Steps). Hidden when there is only one choice. */
@Component({
  selector: 'atlas-destination-picker',
  imports: [MatFormField, MatLabel, MatOption, MatSelect],
  templateUrl: './destination-picker.html',
  styleUrl: './destination-picker.scss',
})
export class AtlasDestinationPicker {
  readonly options = input.required<readonly DestinationOption[]>();
  readonly value = input<string | null>(null);
  readonly valueChange = output<string>();
}
