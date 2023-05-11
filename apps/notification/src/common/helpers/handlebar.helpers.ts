import Handlebars from 'handlebars';
import { DateTime } from 'luxon';

// Note: Handlebars Helpers registered for use in templates in the app.module.ts
//       on application start.

Handlebars.registerHelper('formatDate', (date, timeZone, format) => {
  if (!date) {
    return null;
  }

  return DateTime.fromJSDate(new Date(date), { zone: timeZone }).toFormat(
    format,
  );
});
