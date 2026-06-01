import React from 'react';
import Notification from './Notification';
import { NotificationProvider } from './Notification';

export default function Layout({ children }) {
  return (
    <NotificationProvider>
      <Notification />
      {children}
    </NotificationProvider>
  );
}
