function groupDataByDateAndTime(data) {
  return data.reduce((acc, { Date, time }) => {
    acc[Date] = acc[Date] || [];
    acc[Date].push(time);
    return acc;
  }, {});
}

function getCurrentWeekArray(inputDate) {
  const currentDate = new Date(inputDate);
  const dayOfWeek = currentDate.getDay();
  const startDate = new Date(currentDate);
  startDate.setDate(
    startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  ); // Adjust to Monday if the current day is Sunday
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 4); // End date is 4 days after the start date (Monday to Friday)

  const weekArray = Array.from({ length: 5 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + index);
    return {
      dayName: date.toLocaleDateString("en-IN", { weekday: "short" }),
      date: `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}/${date.getFullYear()}`,
    };
  });
  return weekArray;
}

function matchDatesWithData(weekArray, dataByDateAndTime) {
  return weekArray.map(({ dayName, date }) => ({
    dayName,
    date,
    times: dataByDateAndTime[date] || null,
  }));
}

function convertTimeToIST(time) {
  const [hour, minute, meridiem] = time.split(/:| /);
  let hours = parseInt(hour, 10);
  if (meridiem.toLowerCase() === "pm" && hours !== 12) {
    hours += 12;
  }

  hours = (hours + 5) % 24; // Adding 5 hours for IST offset and handling overflow
  let minutes = parseInt(minute, 10) + 30; // Adding 30 minutes for IST offset
  if (minutes >= 60) {
    hours++; // Increment hour if minutes exceed 60
    minutes %= 60; // Reset minutes
  }

  let formattedHour = hours % 12 || 12; // Convert hour to 12-hour format
  let period = hours >= 12 ? "pm" : "am"; // Determine if it's AM or PM

  // Special handling for midnight
  if (hours === 24 && minutes === 0) {
    formattedHour = 12;
    period = "am";
  } else if (hours === 12 && minutes === 0) {
    period = "pm"; // Adjust 12:00 am to pm for IST
  }

  formattedHour = String(formattedHour).padStart(2, "0");
  const formattedMinute = String(minutes).padStart(2, "0");
  const istTime = `${formattedHour}:${formattedMinute} ${period}`;
  return istTime;
}

function convertTimeToUTC(time) {
  const [hour, minute, meridiem] = time.split(/:| /);
  let hours = parseInt(hour, 10);

  if (
    hours === 12 &&
    (minute === "00" || minute === "30") &&
    meridiem.toLowerCase() === "am"
  ) {
    hours = 19; // 12 am becomes 6 pm in UTC
  } else {
    if (meridiem.toLowerCase() === "pm" && hours !== 12) {
      hours += 12;
    }
    hours = (hours - 5 + 24) % 24;
    // Subtract 5 hours for UTC offset and handle underflow
  }

  let minutes = parseInt(minute, 10) - 30; // Subtract 30 minutes for UTC offset
  if (minutes < 0) {
    hours--; // Decrement hour if minutes are negative
    minutes += 60; // Adjust minutes to positive value
  }

  let formattedHour = hours % 12 || 12; // Convert hour to 12-hour format
  const period = hours >= 12 ? "pm" : "am"; // Determine if it's AM or PM

  formattedHour = String(formattedHour).padStart(2, "0");
  const formattedMinute = String(minutes).padStart(2, "0");
  const utcTime = `${formattedHour}:${formattedMinute} ${period}`;
  return utcTime;
}

function generateTimeSlots() {
  const timeSlots = [];

  for (let hour = 8; hour <= 23; hour++) {
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const meridiem = hour >= 12 ? "pm" : "am";

    const timeSlotAM = `${String(formattedHour).padStart(
      2,
      "0"
    )}:00 ${meridiem}`;
    const timeSlotPM = `${String(formattedHour).padStart(
      2,
      "0"
    )}:30 ${meridiem}`;

    timeSlots.push(timeSlotAM);
    if (hour !== 23) timeSlots.push(timeSlotPM);
  }

  return timeSlots;
}

function parseDate(dateString) {
  const parts = dateString.split("/");

  // months in JavaScript are 0-based, so we subtract 1 from the month part
  return new Date(parts[2], parts[1] - 1, parts[0]);
}

export {
  groupDataByDateAndTime,
  getCurrentWeekArray,
  matchDatesWithData,
  convertTimeToUTC,
  convertTimeToIST,
  generateTimeSlots,
  parseDate,
};
