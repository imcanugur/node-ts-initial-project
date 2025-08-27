export function formatValidationErrors(errors: any[]): {
  [key: string]: string[];
} {
  return errors.reduce(
    (acc, error) => {
      if (!acc[error.property]) {
        acc[error.property] = [];
      }
      acc[error.property].push(...Object.values(error.constraints || {}));
      return acc;
    },
    {} as { [key: string]: string[] },
  );
}
