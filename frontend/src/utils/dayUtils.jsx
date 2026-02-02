export const normalizeDays = (days = []) =>
  days.map((d, i) => ({
    day: d.day || `Dan ${i + 1}`,
    exercises: Array.isArray(d.exercises)
      ? d.exercises.filter((ex) => ex && ex.exerciseId)
      : [],
  }));

export const addExerciseToDayUtil = (days, dayIndex, exerciseId) => {
  const updated = [...days];
  updated[dayIndex].exercises = [
    ...updated[dayIndex].exercises,
    { exerciseId },
  ];
  return normalizeDays(updated);
};

export const removeExerciseFromDayUtil = (days, dayIndex, exIndex) => {
  const updated = [...days];
  updated[dayIndex].exercises = updated[dayIndex].exercises.filter(
    (_, i) => i !== exIndex,
  );
  return normalizeDays(updated);
};
