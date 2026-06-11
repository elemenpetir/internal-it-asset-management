export function formatDateForInput(dateValue) {
  if (!dateValue) return "";

  if (typeof dateValue === "string") {
    return dateValue.split("T")[0];
  }

  return "";
}

export function formatDateForDisplay(dateValue) {
  if (!dateValue) return "-";

  if (typeof dateValue === "string") {
    return dateValue.split("T")[0];
  }

  return "-";
}
