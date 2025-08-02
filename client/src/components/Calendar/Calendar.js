import React, { Component } from 'react';
import { Helmet } from 'react-helmet-async';
import CalendarDays from './CalendarDays';
import './Calendar.scss';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default class Calendar extends Component {
  constructor() {
    super();

    // Define weekdays and months for display
    this.weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    this.months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    this.state = {
      currentDay: new Date(), // Current displayed date 
      selectedDate: null, // User-selected date
      events: {} // Store events grouped by date
    };
  }

  componentDidMount() {
    // Initialize state with today's date and fetch events
    this.setState(
      {
        currentDay: new Date(),
        selectedDate: new Date(),
      },
      this.fetchEvents // Fetch events after setting today's date
    );
  }

  // Fetch events from the backend
  fetchEvents = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API}/api/events`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const eventsObject = {};

      //data.forEach((event) => {
      // Iterate through each event and check if it's full
      for (const event of data) {
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

        // Check if the class is full
        const classStatusResponse = await fetch(
          `${process.env.REACT_APP_API}/api/class-status?classTitle=${encodeURIComponent(event.title)}&date=${event.date}`
        );

        const classStatusData = await classStatusResponse.json();
        const isFull = classStatusData.isFull; // Boolean indicating if class is full

        if (!eventsObject[dateKey]) {
          eventsObject[dateKey] = [];
        }

        eventsObject[dateKey].push({
          title: event.title,
          time: formatTime(event.time), // Formatted time for display
          rawTime: event.time, // Raw time for calculations
          location: event.location,
          signUpLink: event.signUpLink,
          isExternal: event.isExternal || false,
          isFull, // Store class full status
        });
      }

      this.setState({ events: eventsObject }, this.setFirstAvailableEvent);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // Set the first available event or default to today
  setFirstAvailableEvent = () => {
    const { events } = this.state;

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const formattedToday = `${today.getFullYear()}-${(today.getMonth() + 1)
      .toString()
      .padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const sortedDates = Object.keys(events).sort((a, b) => new Date(a) - new Date(b));

    // Always set today as the first date, even if there are no events for today
    this.setState({
      currentDay: today,
      selectedDate: today,
    });
    if (events[formattedToday]) {
    } else {
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

    // Format the selected date for matching events
    const formattedDate = selectedDate
      ? `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`
      : null;

    // Retrieve events for the selected date
    const eventsForDate = formattedDate ? events[formattedDate] || [] : [];

    return (
      <div className="calendar-container">
        <motion.div
          className="calendar-top"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="calendar-overlay">
            <div className="calendar-overlay-text">
              <h1>Where to find me</h1>
              <p>Join me in these practices!</p>
              <p>Let’s move, breathe, and be present together, creating space for growth and connection.</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="calendar-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <h1 className="section-title">Upcoming Yoga Classes and Events</h1>
          <div className="title-line"></div>
        </motion.div>
        <motion.div
          className="calendar-section"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div className="calendar">
            <div className="calendar-header">
              <button onClick={this.handlePreviousMonth}>&lt;</button>
              <h2>
                {this.months[currentDay.getMonth()]} {currentDay.getFullYear()}
              </h2>
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
                <h3>
                  Events on {this.months[selectedDate.getMonth()]}{' '}
                  {selectedDate.getDate()},{' '}
                  {selectedDate.getFullYear()}
                </h3>
              </div>
              <div className="availability-times">
                {eventsForDate.length > 0 ? (
                  eventsForDate.map((event, index) => {

                    // Calculate if the event is in the past
                    const eventDateTime = new Date(`${formattedDate}T${event.rawTime}`);
                    const isPast = eventDateTime < new Date();

                    return (
                      <div
                        key={index}
                        className={`event-details ${isPast ? 'past-event' : ''}`}
                      >
                        <p>{event.title}</p>
                        <p>{event.time}</p>
                        <p>at {event.location}</p>
                        <p>
                          <Link to="/about?section=classDescriptions" rel="noopener noreferrer">
                            More Info
                          </Link>
                        </p>
                        <p>
                          {!isPast ? (
                            event.isFull ? ( // Check if the class is full
                              <span className="disabled-link">Class Full</span>
                            ) : event.signUpLink ? (
                              <a
                                href={event.signUpLink}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Sign Up
                              </a>
                            ) : (
                              <Link
                                to={`/signup-selection?date=${formattedDate}&title=${encodeURIComponent(event.title)}&location=${encodeURIComponent(event.location)}`}
                              >
                                Sign Up
                              </Link>
                            )
                          ) : (
                            <span className="disabled-link">Sign Up</span>
                          )}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p>No events on this day.</p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }
}  