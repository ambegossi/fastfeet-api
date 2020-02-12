import { getHours, parseISO } from 'date-fns';

// Validate time between 8-18 hours
module.exports = function validateTime(date) {
  // date format: "2020-02-11T16:00:00-03:00"
  const parsedStartDate = parseISO(date);

  const hourStart = getHours(parsedStartDate);

  // Validate time between 8-18 hours
  if (hourStart < 8 || hourStart > 18) {
    return false;
  }

  return true;
};
