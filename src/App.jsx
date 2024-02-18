/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { BsFillCaretLeftFill, BsFillCaretRightFill } from "react-icons/bs";
import { v4 as uuidv4 } from "uuid";
import data from "./data/data.json";
import {
  groupDataByDateAndTime,
  getCurrentWeekArray,
  matchDatesWithData,
  parseDate,
  convertTimeToIST,
  generateTimeSlots,
  convertTimeToUTC,
} from "./utils/helper";

const inputData = groupDataByDateAndTime(data);

function App() {
  const [date, setDate] = useState(
    new Date().toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );

  const [selectedTimeZone, setSelectedTimeZone] = useState("UTC");

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col space-y-8 items-center w-3/4 h-4/5">
        <Header setDate={setDate} date={date} />
        <TimeZone
          selectedTimeZone={selectedTimeZone}
          setSelectedTimeZone={setSelectedTimeZone}
        />
        <Week date={date} selectedTimeZone={selectedTimeZone} />
      </div>
    </div>
  );
}

function Header({ date, setDate }) {
  function handlePrevious() {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 7);
    setDate(
      newDate.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  function handleNext() {
    let newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 7);
    setDate(
      newDate.toLocaleString("en-IN", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    );
  }

  return (
    <header className="flex justify-around w-full h-8">
      <button onClick={handlePrevious} className="flex items-center space-x-2">
        <BsFillCaretLeftFill className="inline-block" />
        <span>Previous Week</span>
      </button>
      <span>{date}</span>
      <button onClick={handleNext} className="flex items-center space-x-2">
        <span>Next Week</span>
        <BsFillCaretRightFill className="inline-block" />
      </button>
    </header>
  );
}

function TimeZone({ setSelectedTimeZone, selectedTimeZone }) {
  function handleTimeZone(e) {
    e.preventDefault();
    setSelectedTimeZone(e.target.value);
  }

  return (
    <div className="self-start flex flex-col space-y-4 w-full">
      <label htmlFor="">TimeZone :</label>
      <select
        onChange={handleTimeZone}
        className="w-full h-6"
        value={selectedTimeZone}
        name="selectTimeZone"
        id=""
      >
        <option defaultValue={true} value="IST">
          [UTC +5.30] Indian Standard Time
        </option>
        <option value="UTC">[UTC +0] Greenwich Mean Time</option>
      </select>
    </div>
  );
}

function Week({ date, selectedTimeZone }) {
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const inputDate = new Date(date);
    const weekArr = getCurrentWeekArray(inputDate);
    const matchedWeekArr = matchDatesWithData(weekArr, inputData);
    setWeekDays(matchedWeekArr);
  }, [date]);

  return (
    <div className="w-full h-full grid grid-cols-6 gap-x-6">
      <WeekDayComp weekDays={weekDays} />
      <CheckBoxComp weekDays={weekDays} selectedTimeZone={selectedTimeZone} />
    </div>
  );
}

function CheckBoxComp({ weekDays, selectedTimeZone }) {
  const [timesArr, setTimesArr] = useState([]);
  const currentDate = new Date();

  useEffect(() => {
    let convertArr = [];
    if (selectedTimeZone === "IST") {
      let tempArr = generateTimeSlots();
      convertArr = tempArr.map((time) => convertTimeToIST(time));
    } else {
      convertArr = generateTimeSlots();
    }
    setTimesArr(convertArr);
  }, [selectedTimeZone]);

  return (
    <ul className="col-span-5 w-full flex flex-col space-y-10">
      {weekDays?.map((day, index) =>
        parseDate(day?.date) < currentDate ? (
          <span key={uuidv4()} className="flex justify-start h-32">
            Past
          </span>
        ) : (
          <CheckListComp
            weekDays={weekDays}
            timesArr={timesArr}
            selectedTimeZone={selectedTimeZone}
            day={index}
            key={uuidv4()}
          />
        )
      )}
    </ul>
  );
}

function WeekDayComp({ weekDays }) {
  return (
    <ul className="col-span-1 space-y-12">
      {weekDays?.map((day) => (
        <DayComp day={day} key={uuidv4()} />
      ))}
    </ul>
  );
}

function DayComp({ day }) {
  return (
    <li className="flex flex-col items-center h-32">
      <span>{day?.dayName}</span>
      <span>{day?.date}</span>
    </li>
  );
}

function CheckListComp({ weekDays, timesArr, day, selectedTimeZone }) {
  // console.log(weekDays);

  return (
    <ul className="flex items-center justify-start flex-wrap h-32">
      {timesArr.map((checkBox, index) => (
        <CheckBox
          key={index + 1}
          label={checkBox}
          isChecked={
            weekDays[day]?.times?.includes(
              selectedTimeZone === "IST" ? convertTimeToUTC(checkBox) : checkBox
            )
              ? true
              : false
          }
        />
      ))}
    </ul>
  );
}

function CheckBox({ label, isChecked }) {
  return (
    <li className="px-4">
      <div>
        <label>
          <input className="mr-2" type="checkbox" defaultChecked={isChecked} />
          <span>{String(label).padStart(2, "0")}</span>
        </label>
      </div>
    </li>
  );
}

export default App;
