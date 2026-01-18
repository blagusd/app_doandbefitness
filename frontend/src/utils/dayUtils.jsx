export const toggleDayState = (prev, dayName) => ({
  ...prev,
  [dayName]: !prev[dayName],
});

export const addExerciseToDayUtil = (weekDays, dayIndex, exerciseId) => {
  const updated = [...weekDays];
  updated[dayIndex].exercises.push(exerciseId);
  return updated;
};

export const removeExerciseFromDayUtil = (weekDays, dayIndex, exIndex) => {
  const updated = [...weekDays];
  updated[dayIndex].exercises.splice(exIndex, 1);
  return updated;
};
