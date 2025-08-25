import { TextField } from '@mui/material';

export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  ...rest
}) {
  return (
    <TextField
      label={label}
      value={value}
      onChange={e => onChange(e.target.value)}
      type={type}
      required={required}
      fullWidth
      size="medium"
      margin="dense"
      {...rest}
    />
  );
}
