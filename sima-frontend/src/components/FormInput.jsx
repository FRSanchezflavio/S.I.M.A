import { 
  TextField, 
  useMediaQuery, 
  useTheme,
  FormHelperText,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';

export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  helperText,
  startIcon,
  endIcon,
  placeholder,
  multiline = false,
  rows = 1,
  maxLength,
  ...rest
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordField = type === 'password';
  const actualType = isPasswordField && showPassword ? 'text' : type;

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    
    // Aplicar límite de caracteres si se especifica
    if (maxLength && newValue.length > maxLength) {
      return;
    }
    
    onChange(newValue);
  };

  return (
    <>
      <TextField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        type={actualType}
        required={required}
        error={!!error}
        fullWidth
        multiline={multiline}
        rows={multiline ? rows : undefined}
        size={isMobile ? 'medium' : 'medium'}
        margin={isMobile ? 'normal' : 'dense'}
        variant="outlined"
        InputLabelProps={{
          shrink: true,
          style: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            fontWeight: 500,
          }
        }}
        InputProps={{
          style: {
            fontSize: isMobile ? '0.9rem' : '1rem',
            borderRadius: isMobile ? '8px' : '12px',
          },
          startAdornment: startIcon ? (
            <InputAdornment position="start">
              {startIcon}
            </InputAdornment>
          ) : null,
          endAdornment: (
            <>
              {isPasswordField && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handlePasswordToggle}
                    edge="end"
                    size={isMobile ? 'small' : 'medium'}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )}
              {endIcon && !isPasswordField && (
                <InputAdornment position="end">
                  {endIcon}
                </InputAdornment>
              )}
            </>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: 'var(--primary)',
              borderWidth: '2px',
            },
            '&.Mui-focused fieldset': {
              borderColor: 'var(--primary)',
              borderWidth: '2px',
              boxShadow: '0 0 0 3px rgba(21, 77, 113, 0.1)',
            },
            '&.Mui-error fieldset': {
              borderColor: theme.palette.error.main,
            },
          },
          '& .MuiInputLabel-root': {
            color: 'rgba(0, 0, 0, 0.6)',
            '&.Mui-focused': {
              color: 'var(--primary)',
            },
            '&.Mui-error': {
              color: theme.palette.error.main,
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: isMobile ? '12px 14px' : '14px 16px',
          },
          mb: isMobile ? 2 : 1.5,
        }}
        {...rest}
      />
      
      {/* Helper text personalizado con contador de caracteres */}
      {(helperText || error || maxLength) && (
        <FormHelperText 
          error={!!error}
          sx={{
            mx: 0,
            mt: 0.5,
            mb: isMobile ? 1 : 0.5,
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{error || helperText}</span>
          {maxLength && (
            <span style={{ 
              color: value.length > maxLength * 0.9 ? 
                theme.palette.warning.main : 
                'rgba(0, 0, 0, 0.6)',
              fontWeight: value.length > maxLength * 0.9 ? 600 : 400,
            }}>
              {value.length}/{maxLength}
            </span>
          )}
        </FormHelperText>
      )}
    </>
  );
}
