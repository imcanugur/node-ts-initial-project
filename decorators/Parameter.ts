import "reflect-metadata";

export interface ParameterMetadata {
  name: string;
  type: "param" | "query" | "body" | "header";
  description?: string;
  required?: boolean;
  multiple: boolean;
}

export function Parameter(
  name: string,
  type: "param" | "query" | "body" | "header" = "param",
  description?: string,
  required = false,
  multiple = false,
) {
  return function (target: any, propertyKey: string, parameterIndex: any) {
    const existingParameters: ParameterMetadata[] =
      Reflect.getMetadata(`parameters:${propertyKey}`, target) || [];
    existingParameters.push({ name, type, description, required, multiple });
    Reflect.defineMetadata(
      `parameters:${propertyKey}`,
      existingParameters,
      target,
    );
  };
}
