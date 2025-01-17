import React from 'react';
import './CalendarDays.scss';

function CalendarDays({
  day,
  changeCurrentDay,
  events = {},
  highlightedDate = new Date(), // Default to today
  disablePastDates = true, // Disable past dates by default
  disabledDates = [],
  highlightedSlots = [],
}) {
  let firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  let weekdayOfFirstDay = firstDayOfMonth.getDay();
  let currentDays = [];

  for (let dayIndex = 0; dayIndex < 42; dayIndex++) {
    if (dayIndex === 0 && weekdayOfFirstDay === 0) {
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
    } else if (dayIndex === 0) {
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (dayIndex - weekdayOfFirstDay));
    } else {
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }

    const formattedDate = `${firstDayOfMonth.getFullYear()}-${(firstDayOfMonth.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${firstDayOfMonth.getDate().toString().padStart(2, '0')}`;

    let calendarDay = {
      currentMonth: firstDayOfMonth.getMonth() === day.getMonth(),
      date: new Date(firstDayOfMonth),
      month: firstDayOfMonth.getMonth(),
      number: firstDayOfMonth.getDate(),
      selected: firstDayOfMonth.toDateString() === day.toDateString(),
      year: firstDayOfMonth.getFullYear(),
      isToday: firstDayOfMonth.toDateString() === highlightedDate.toDateString(),
      isPast: disablePastDates && firstDayOfMonth < new Date().setHours(0, 0, 0, 0),
      isDisabled: disabledDates.includes(formattedDate),
    };

    currentDays.push(calendarDay);
  }

  // Check if a given day has an event:
  const isEventDay = (day) => {
    const formattedDate = `${day.date.getFullYear()}-${(day.date.getMonth() + 1).toString().padStart(2, '0')}-${day.date.getDate().toString().padStart(2, '0')}`;
    return events[formattedDate] !== undefined;
  };

  // Check if a given day has available slots:
  const isSlotDay = (day) => {
    const formattedDate = `${day.date.getFullYear()}-${(day.date.getMonth() + 1).toString().padStart(2, '0')}-${day.date.getDate().toString().padStart(2, '0')}`;
    return highlightedSlots.includes(formattedDate);
  };

  return (
    <div className="table-content">
      {currentDays.map((day, index) => (
        <div
          key={index}
          className={`calendar-day ${day.currentMonth ? '' : 'other-month'} 
                      ${day.isToday ? 'highlighted' : ''} 
                      ${day.isPast || day.isDisabled ? 'disabled' : ''} 
                      ${isEventDay(day) ? 'has-event' : ''} 
                      ${isSlotDay(day) ? 'has-slot' : ''}`} // Add has-slot for days with slots
          onClick={() => !(day.isPast || day.isDisabled) && changeCurrentDay(day)}
        >
          <p>{day.number}</p>
          {isEventDay(day) && <div className="event-indicator"></div>}
          {isSlotDay(day) && <div className="slot-indicator"></div>} {/* Slot indicator */}
        </div>
      ))}
    </div>
  );
}

export default CalendarDays;
