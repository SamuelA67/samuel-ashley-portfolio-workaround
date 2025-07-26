//set current date and initialize habit
let currentDate = new Date();
let currentHabit = "";

//helper functions to save to local storage
//saves object of completed dates per habit
//{ "Biking": ["2025-07-22", "2025-07-23"], "Lifting": [] }
function saveCompletedDates(data) 
{
  localStorage.setItem("habitCalendar", JSON.stringify(data));
}

//retrieve the completed dates object from localStorage
function getCompletedDates() 
{
  return JSON.parse(localStorage.getItem("habitCalendar")) || {};
}

//save the list of habit names
//["Biking", "Lifting"]
function saveHabitList(list) 
{
  localStorage.setItem("habitList", JSON.stringify(list));
}

// Retrieve the list of habit names
function getHabitList()
{
  return JSON.parse(localStorage.getItem("habitList")) || [];
}


//HABIT FUNCTIONS

//add new habit
function addHabit()
{
  const newHabitInput = document.getElementById("newHabit");
  const name = newHabitInput.value.trim();

  if(!name)
  {
    //exit if habit is empty
    return; 
  } 

  const habits = getHabitList();

  //ensure habit isnt already in the list
  if(!habits.includes(name)) 
  {
    //add habit to habit list
    habits.push(name);
    //save to local storage
    saveHabitList(habits);

    //initialize new habits completed dates list
    //get current structure
    const allDates = getCompletedDates();
    //add the new key to the structure
    allDates[name] = [];
    //console.log('allDates',allDates);

    //save back into local storage
    saveCompletedDates(allDates);
  }

  //clear habit input field
  newHabitInput.value = ""; 
  //update drop down list
  loadHabitSelector(name);
}

function deleteHabit()
{
  if(!currentHabit)
  {
    return;
  }
     
  //confirm delete
  const confirmDelete = confirm(`Are you sure you want to delete this habit: ${currentHabit}?`);
  if(!confirmDelete)
  {
    return;
  } 

  //get list of all habits
  let habits = getHabitList();

  //new list to exclude deleted habit
  let updatedHabits = [];

  //loop through every habit
  for(let i = 0; i < habits.length; i++)
  {
    let current = habits[i];

    //keep habits that arent the one being deleted
    if(current !== currentHabit)
    {
      updatedHabits.push(current);
    }
  }
  //console.log('updatedHabits',updatedHabits);

  //save the new list
  saveHabitList(updatedHabits);

  //remove completed dates for that habit
  const allDates = getCompletedDates();
  delete allDates[currentHabit];
  saveCompletedDates(allDates);

  //reset current habit and refresh selector
  currentHabit = "";
  loadHabitSelector();
}

//populate habit dd and set selected
function loadHabitSelector(selected = "") 
{
  const select = document.getElementById("habitSelect");
  const habits = getHabitList();

  select.innerHTML = "";

  //loop through each habit and create an option
  habits.forEach(habit => {
    const option = document.createElement("option");
    option.value = habit;
    option.textContent = habit;

    //set selected attribut if habit matches current option
    if(habit === selected) 
    {
      option.selected = true;
    }

    //append the option to the habit dd
    select.appendChild(option);
  });

  //if habits isnt empty but not selection is passed in, set to first habit
  if(habits.length && !selected) 
  {
    currentHabit = habits[0];
    select.value = currentHabit;
  } 
  //if selected is passed in set to that (add)
  else if(selected)
  {
    currentHabit = selected;
  }

  //setting onchange to select that updates current habit and rerenders the calendar
  select.onchange = () => {
    currentHabit = select.value;
    renderCalendar();
  };

  //initial render of calendar if habit exists
  if(currentHabit)
  {
    renderCalendar();
  }
}



//CALENDAR FUNCTIONS

//convert to string in 'YYYY-MM-DD' format
function formatDate(date) 
{
  return date.toISOString().split("T")[0];
}

//draw the calendar grid based on current month and selected habit
function renderCalendar() 
{
  const calendar = document.getElementById("calendar");
  const monthYear = document.getElementById("monthYear");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  //first day of the month
  const firstDay = new Date(year, month, 1); 
  //last day of the month
  const lastDay = new Date(year, month + 1, 0);     
  //the day of week for the 1st      
  const startDay = firstDay.getDay(); 
  //console.log('startday', startDay);                    

  //load list of completed dates for habit
  const completedDates = getCompletedDates(); 
  //get dates for current habit/key            
  const setDates = completedDates[currentHabit] || [];

  //clear calendar
  calendar.innerHTML = "";  
  //header                              
  monthYear.textContent = `${firstDay.toLocaleString("default", { month: "long" })} ${year}`;

  //adds empty divs for days of week until the start of the month
  for(let i = 0; i < startDay; i++)
  {
    const blank = document.createElement("div");
    blank.classList.add("day");
    calendar.appendChild(blank);
  }
  //console.log('calendar',calendar)

  //fill calendar with days of the month
  for(let day = 1; day <= lastDay.getDate(); day++)
  {
    const date = new Date(year, month, day);
    const dateStr = formatDate(date);
    const div = document.createElement("div");

    div.classList.add("day");
    //setting whatever index to display the day
    div.textContent = day;

    //check setDates to see if it includes the current date of the loop 
    if(setDates.includes(dateStr))
    {
      //if so mark as completed
      div.classList.add("completed");
    }

    //set onclick for all the divs that toggles completion
    div.onclick = () => {
      //console.log('dateStr', dateStr)
      //load all completed dates
      const allDates = getCompletedDates();

      //get the list of completed dates for the current habit
      const habitDates = allDates[currentHabit] || [];

      //check if the clicked date is in the completed list
      if (habitDates.includes(dateStr))
      {
        //new list to exclude clicked one
        let updatedDates = [];

        //loop through every date
        for(let i = 0; i < habitDates.length; i++)
        {
          let current = habitDates[i];

          //keep dates that arent the one we clicked
          if(current !== dateStr)
          {
            updatedDates.push(current);
          }
        }

        //update the stored list
        allDates[currentHabit] = updatedDates;

      } 
      else
      {
        //else add the date to the list
        habitDates.push(dateStr);

        //update the stored list
        allDates[currentHabit] = habitDates;
      }

      //save back to localStorage
      saveCompletedDates(allDates);

      //rerender the calendar to show updated state
      renderCalendar();
    };

    //use grid styling to handle the calendar structure
    calendar.appendChild(div);
  }
}


//MONTH NAVIGATION

//change month by offset (-1 or 1)
function changeMonth(offset) 
{
  currentDate.setMonth(currentDate.getMonth() + offset);
  renderCalendar();
}

//initial setup when page loads
loadHabitSelector();
