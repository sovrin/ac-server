import type { ContainerSnapshot } from '@contracts/container';

export class Container {
    readonly id: string;
    private _data: ContainerSnapshot;

    constructor(data: ContainerSnapshot) {
        this.id = data.id;
        this._data = data;
    }

    get name(): string {
        return this._data.name;
    }

    get state(): string {
        return this._data.state;
    }

    get labels(): Record<string, string> {
        return this._data.labels;
    }

    update(data: ContainerSnapshot): void {
        if (data.id !== this.id) {
            throw new Error(
                `Container ID mismatch: expected "${this.id}", got "${data.id}"`,
            );
        }

        this._data = data;
    }

    toSnapshot(): ContainerSnapshot {
        return { ...this._data };
    }
}
