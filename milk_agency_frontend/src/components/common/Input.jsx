import styles from './Input.module.css';

export default function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  label,
  className = '',
  ...props
}) {
  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.input} ${error ? styles.error : ''} ${className}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
