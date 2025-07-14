export abstract class BaseConfig<T> {
  constructor(public readonly settingName: string) {}

  abstract get(): Promise<T>;
  abstract save(config: T): Promise<void>;
  abstract validate(obj: unknown): obj is T;
}
