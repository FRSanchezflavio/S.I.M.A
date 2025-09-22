import React from 'react';
import { TextField } from '@mui/material';

// Componente de fecha nativo que no requiere dependencias externas
const SafeDatePicker = ({
  label,
  value,
  onChange,
  size = 'small',
  fullWidth = true,
  ...props
}) => {
  // Fallback a TextField nativo
  return (
    <TextField
      label={label}
      type="date"
      size={size}
      fullWidth={fullWidth}
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={e => {
        const dateValue = e.target.value ? new Date(e.target.value) : null;
        onChange(dateValue);
      }}
      InputLabelProps={{ shrink: true }}
      {...props}
    />
  );
};

export default SafeDatePicker;
