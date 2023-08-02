import { SpanOptions } from '@opentelemetry/api';

export interface OTelSpanDecoratorOptions extends SpanOptions {
  /**
   * Name of the span. Overrides the default behavior to set the name
   * to equal to the `ClassName.MethodName`.
   */
  name?: string;
}
