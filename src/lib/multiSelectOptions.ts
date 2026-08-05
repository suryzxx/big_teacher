export type AllOption = "All";

export function toggleMultiSelectOption<Option extends string>(
  values: Option[],
  option: Option,
  allOption: Option,
) {
  if (option === allOption) return [allOption];

  const current = values.includes(allOption) ? [] : values;
  const nextValues = current.includes(option)
    ? current.filter((value) => value !== option)
    : [...current, option];

  return nextValues.length === 0 ? [allOption] : nextValues;
}

export function removeMultiSelectOption<Option extends string>(
  values: Option[],
  option: Option,
  allOption: Option,
) {
  const nextValues = values.filter((value) => value !== option);
  return nextValues.length === 0 ? [allOption] : nextValues;
}
