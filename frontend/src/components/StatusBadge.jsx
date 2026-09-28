/* StatusBadge Component: Displays color-coded badge for complaint status */
export default function StatusBadge({ status }) {
  let cssClass = "badge-pending";
  if (status === "Assigned") cssClass = "badge-assigned";
  if (status === "In Progress") cssClass = "badge-inprogress";
  if (status === "Work Completed") cssClass = "badge-completed";
  if (status === "Resolved") cssClass = "badge-resolved";

  return <span className={`badge ${cssClass}`}>{status}</span>;
}
