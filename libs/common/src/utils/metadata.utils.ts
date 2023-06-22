export function hasSelectors(
  labels: string[],
  values: any,
  metadata: any,
): boolean {
  if ((!values && metadata) || (values && !metadata)) {
    return false;
  }

  if (!values && !metadata) {
    return true;
  }

  return labels.every((label) => values[label] === metadata[label]);
}
