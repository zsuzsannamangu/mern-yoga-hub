import React, { Component } from 'react';
import CalendarDays from './CalendarDays';
import './Calendar.scss';
import { Link } from 'react-router-dom';

export default class Calendar extends Component {
  constructor() {
    super();

    this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    this.state = {
      currentDay: new Date(),
      selectedDate: null,
      events: {}
    };
  }

  componentDidMount() {
    this.fetchEvents();
  }

  fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const eventsObject = {};
      data.forEach((event) => {
        const dateKey = event.date; // Ensure event.date is in YYYY-MM-DD format
        const formatTime = (time) => {
          const [hour, minute] = time.split(':');
          const date = new Date();
          date.setHours(hour, minute);
          return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        };

        if (!eventsObject[dateKey]) {
          eventsObject[dateKey] = [];
        }

        eventsObject[dateKey].push({
          title: event.title,
          time: formatTime(event.time),
          location: event.location,
          signUpLink: event.signUpLink,
          isExternal: event.isExternal || false, // Check if it's an external link
        });
      });

      this.setState({ events: eventsObject }, this.setFirstAvailableEvent);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  setFirstAvailableEvent = () => {
    const { events } = this.state;

    const sortedDates = Object.keys(events).sort((a, b) => new Date(a) - new Date(b));
    if (sortedDates.length > 0) {
      const firstDate = sortedDates[0];
      const [year, month, day] = firstDate.split('-');
      this.setState({
        currentDay: new Date(year, month - 1, day),
        selectedDate: new Date(year, month - 1, day),
      });
    }
  };

  changeCurrentDay = (day) => {
    const selectedDate = new Date(day.year, day.month, day.number);
    this.setState({ currentDay: selectedDate, selectedDate });
  };

  handlePreviousMonth = () => {
    this.setState((prevState) => ({
      currentDay: new Date(prevState.currentDay.getFullYear(), prevState.currentDay.getMonth() - 1, 1)
    }));
  };

  handleNextMonth = () => {
    this.setState((prevState) => ({
      currentDay: new Date(prevState.currentDay.getFullYear(), prevState.currentDay.getMonth() + 1, 1)
    }));
  };

  render() {
    const { currentDay, selectedDate, events } = this.state;

    const formattedDate = selectedDate
      ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
      : null;
    const eventsForDate = formattedDate ? events[formattedDate] || [] : [];

    return (
      <div className="calendar-container">
        <div className="calendar-top">
          <div className="calendar-overlay">
            <div className="calendar-overlay-text">
              <p>Join me in these practices!</p>
              <p>Let’s move, breathe, and be present together, creating space for growth and connection.</p>
            </div>
          </div>
        </div>
        <div className="calendar-title">
          <h2 className="section-title">Upcoming Yoga Classes and Events</h2>
          <div className="title-line"></div>
        </div>
        <div className="calendar-section">
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={this.handlePreviousMonth}>&lt;</button>
              <h2>{this.months[currentDay.getMonth()]} {currentDay.getFullYear()}</h2>
              <button onClick={this.handleNextMonth}>&gt;</button>
            </div>
            <div className="calendar-body">
              <div className="table-header">
                {this.weekdays.map((weekday) => (
                  <div className="weekday" key={weekday}>
                    <p>{weekday}</p>
                  </div>
                ))}
              </div>
              <CalendarDays
                day={currentDay}
                events={events}
                changeCurrentDay={this.changeCurrentDay}
              />
            </div>
          </div>

          {selectedDate && (
            <div className="availability-section">
              <div className="availability-header">
                <h3>Events on {this.months[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}</h3>
              </div>
              <div className="availability-times">
                {eventsForDate.length > 0 ? (
                  eventsForDate.map((event, index) => (
                    <div key={index} className="event-details">
                      <p> {event.title}</p>
                      <p> {event.time}</p>
                      <p>at {event.location}</p>
                      <p>
                        <Link to="/about?section=classDescriptions" rel="noopener noreferrer">
                          More Info
                        </Link>
                      </p>

                      <p>
                        {event.signUpLink ? (
                          <a
                            href={event.signUpLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Sign Up
                          </a>
                        ) : (
                          <Link
                            to={`/signup?date=${formattedDate}&title=${encodeURIComponent(event.title)}&location=${encodeURIComponent(event.location)}`}
                          >
                            Sign Up
                          </Link>
                        )}
                      </p>

                    </div>
                  ))
                ) : (
                  <p>No events on this day.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
}