import React from 'react';

const UserGroupIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.969A4.5 4.5 0 0112 10.5c1.252 0 2.444.39 3.372 1.036a4.501 4.501 0 01-3.372 8.464M12 10.5a4.5 4.5 0 00-4.5 4.5v.086c0 1.233.404 2.37 1.09 3.254a4.501 4.501 0 015.82-8.464zM6.375 19.5a4.5 4.5 0 01-1.09-3.254v-.086a4.5 4.5 0 014.5-4.5c.355 0 .701.045 1.036.13a4.501 4.501 0 01-4.24 8.232z" />
  </svg>
);

export default UserGroupIcon;
