import Handlebars from 'handlebars';
import * as moment from 'moment-timezone';

// Note: Handlebars Helpers registered for use in templates in the app.module.ts
//       on application start.

Handlebars.registerHelper('formatDate', (date, timeZone, format) => {
  if (!date) {
    return null;
  }

  return moment(date).tz(timeZone).format(format);
});
