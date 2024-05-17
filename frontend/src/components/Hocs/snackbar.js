import React from 'react';
import { Snackbar } from '@mui/material/';

export default function CustomSnackbar({ message, duration = 6000 }) {
  const [open, setOpen] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setOpen(false);
    }, duration);

    return () => {
      clearTimeout(timer);
    };
  }, [duration]);

  return (
    <Snackbar
      open={open}
      onClose={() => setOpen(false)}
      autoHideDuration={duration}
      message={message}
    />
  );
}
