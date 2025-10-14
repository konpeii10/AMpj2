import React from "react";

interface CurrentTimeIndicatorProps {
  currentTime: Date;
}

export const CurrentTimeIndicator: React.FC<CurrentTimeIndicatorProps> = ({
  currentTime,
}) => {
  const hour = currentTime.getHours();
  const minute = currentTime.getMinutes();
  const top = (hour * 60 + minute) / (24 * 60) * 100;

  return (
    <div
      className="absolute left-0 right-0 h-0.5 bg-red-500"
      style={{ top: `${top}%` }}
    />
  );
};
