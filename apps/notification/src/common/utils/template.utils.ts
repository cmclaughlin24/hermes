import * as flatten from 'flat';

export function compileTextTemplate(text: string, context: any): string {
  const regexPattern = /\{\{[\s\S][a-zA-Z0-1\.]+[\s\S]\}\}/g;

  if (!regexPattern.test(text) || !context) {
    return text;
  }

  if (typeof context !== 'object' || Array.isArray(context)) {
    throw new Error(
      `Invalid Argument: context must be type 'object', recieved ${typeof context}`,
    );
  }

  const flatContext = flatten(context);

  // Todo: Improve error support by checking value is a primitive type.
  return text.replace(regexPattern, (match) => {
    const key = match.replace(/^\{\{|\}\}$/g, '').trim();
    const value = flatContext[key];
    return value;
  });
}
