export interface OscillatorOptions {
    phase : number;
    offset : number;
    frequency : number;
    amplitude : number;
}

export class Oscillator {
    constructor(options?: OscillatorOptions) {
        this.phase = options?.phase ?? 0;
        this.offset = options?.offset ?? 0;
        this.frequency = options?.frequency ?? 0.001;
        this.amplitude = options?.amplitude ?? 1;
    }
  
    phase : number;
    offset : number;
    frequency : number;
    amplitude : number;
  
    private _value? : number;
  
    update() {
      this.phase += this.frequency;
      this._value = this.offset + Math.sin(this.phase) * this.amplitude;
      return this._value;
    }
  
    get value() {
      return this._value;
    }
  }
  