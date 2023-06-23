/**
 * Checks if every label selector's value is equal in the metadata and values
 * arguments.
 * @param {string[]} labels 
 * @param {values} values 
 * @param {metadata} metadata 
 * @returns {boolean}
 */
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
