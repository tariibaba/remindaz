import { isToday, isTomorrow, isYesterday, format } from 'date-fns';

function getReadableDay(date: Date): string {
  let result: string;

  if (isToday(date)) result = 'Today';
  else if (isTomorrow(date)) result = 'Tomorrow';
  else if (isYesterday(date)) result = 'Yesterday';
  else result = format(date, 'dd MMM, yyyy');

  return result;
}

export default getReadableDay;
