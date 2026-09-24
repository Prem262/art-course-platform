import React from 'react';

export const UserAvatar = ({ name = "Alex Johnson", initials = "AJ", size = "md" }) => {
  const sizeClass = size === "sm" ? "avatar-badge-sm" : size === "lg" ? "avatar-badge-lg" : "";

  return (
    <div className={`avatar-badge ${sizeClass}`} title={name} aria-label={name}>
      {initials}
    </div>
  );
};
