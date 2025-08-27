import "reflect-metadata";

export function Description(text: string) {
  return function (target: Object, propertyKey?: string) {
    if (propertyKey) {
      Reflect.defineMetadata(
        `description:${propertyKey}`,
        text,
        target,
        propertyKey,
      );
    } else {
      Reflect.defineMetadata(`description`, text, target);
    }
  };
}

export function getDescription(target: Object, propertyKey?: string) {
  const key = propertyKey ? `description:${propertyKey}` : `description`;
  return Reflect.getMetadata(key, target, propertyKey!);
}
