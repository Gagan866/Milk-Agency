import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.button} ${styles[variant]} ${disabled ? styles.disabled : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
