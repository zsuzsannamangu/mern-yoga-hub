import React from 'react';
import './CalendarDays.scss';

/**
 * CalendarDays Component
 * 
 * Renders a calendar grid for a given month, highlighting events, available slots, 
 * and disabling past dates or custom disabled dates.
 */

function CalendarDays({
  day,
  changeCurrentDay,
  events = {},
  highlightedDate = new Date(), // Default to today
  disablePastDates = true, // Disable past dates by default
  disabledDates = [],
  highlightedSlots = [],
}) {
  // Get first day of the month
  let firstDayOfMonth = new Date(day.getFullYear(), day.getMonth(), 1);
  let weekdayOfFirstDay = firstDayOfMonth.getDay();
  let currentDays = [];

  // Generate calendar days (including days from previous and next months for a full 6-week grid)
  for (let dayIndex = 0; dayIndex < 42; dayIndex++) {
    if (dayIndex === 0 && weekdayOfFirstDay === 0) {
      // If the first day is Sunday, adjust the start date by moving back a full week
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() - 7);
    } else if (dayIndex === 0) {
      // Move back to the start of the week to correctly position the first day
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + (dayIndex - weekdayOfFirstDay));
    } else {
      // Move forward one day at a time
      firstDayOfMonth.setDate(firstDayOfMonth.getDate() + 1);
    }

    // Format the date as YYYY-MM-DD for easy lookup
    const formattedDate = `${firstDayOfMonth.getFullYear()}-${(firstDayOfMonth.getMonth() + 1) // Is the day in the current month?
      .toString()
      .padStart(2, '0')}-${firstDayOfMonth.getDate().toString().padStart(2, '0')}`;

    // Constract the calendarDay object
    let calendarDay = {
      currentMonth: firstDayOfMonth.getMonth() === day.getMonth(),
      date: new Date(firstDayOfMonth),
      month: firstDayOfMonth.getMonth(),
      number: firstDayOfMonth.getDate(),
      selected: firstDayOfMonth.toDateString() === day.toDateString(), // Is this the selected day?
      year: firstDayOfMonth.getFullYear(),
      isToday: firstDayOfMonth.toDateString() === highlightedDate.toDateString(), // Is this today?
      isPast: disablePastDates && firstDayOfMonth < new Date().setHours(0, 0, 0, 0), // Disable past dates
      isDisabled: disabledDates.includes(formattedDate), // Disable specific dates
    };

    currentDays.push(calendarDay);
  }

  /**
   * Checks if a given day has an event.
   * @param {Object} day - A calendar day object.
   * @returns {Boolean} - True if the day has an event.
   */
  const isEventDay = (day) => {
    const formattedDate = `${day.date.getFullYear()}-${(day.date.getMonth() + 1).toString().padStart(2, '0')}-${day.date.getDate().toString().padStart(2, '0')}`;
    return events[formattedDate] !== undefined;
  };

  /**
   * Checks if a given day has available slots.
   * @param {Object} day - A calendar day object.
   * @returns {Boolean} - True if the day has available slots.
   */
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
          {isSlotDay(day) && <div className="slot-indicator"></div>}
        </div>
      ))}
    </div>
  );
}

export default CalendarDays;