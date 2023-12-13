export interface DeliveryWindow {
  /**
   * An integer, between 0 and 6, representing the day of the week where
   * Sunday is 0 and Saturday is 6.
   */
  dayOfWeek: number;

  /**
   * An integer, between 0 and 23, representing the hour at which the delivery
   * window starts.
   */
  atHour: number;

  /**
   * An integer, between 0 and 59, representing the minutes past the hour the
   * delivery window starts.
   */
  atMinute: number;

  /**
   * An integer, greater than 0, representing the length of the delivery window
   * in minutes.
   */
  duration: number;
}
