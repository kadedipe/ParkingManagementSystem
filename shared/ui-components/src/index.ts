// ============================================================================
// UI Components - Main Export Index
// ============================================================================

// parking-management-system/shared/ui-components/src/index.ts

// ============================================================================
// Atoms
// ============================================================================
export { default as Button } from './components/atoms/Button';
export { default as Input } from './components/atoms/Input';
export { default as Typography } from './components/atoms/Typography';
export { default as Icon } from './components/atoms/Icon';
export { default as Avatar } from './components/atoms/Avatar';
export { default as Badge } from './components/atoms/Badge';
export { default as Spinner } from './components/atoms/Spinner';
export { default as Divider } from './components/atoms/Divider';
export { default as Image } from './components/atoms/Image';

// ============================================================================
// Molecules
// ============================================================================
export { default as Card } from './components/molecules/Card';
export { default as CardHeader } from './components/molecules/CardHeader';
export { default as CardContent } from './components/molecules/CardContent';
export { default as CardFooter } from './components/molecules/CardFooter';
export { default as CardMedia } from './components/molecules/CardMedia';
export { default as FormField } from './components/molecules/FormField';
export { default as InputGroup } from './components/molecules/InputGroup';
export { default as Select } from './components/molecules/Select';
export { default as Checkbox } from './components/molecules/Checkbox';
export { default as Radio } from './components/molecules/Radio';
export { default as Switch } from './components/molecules/Switch';
export { default as TextArea } from './components/molecules/TextArea';
export { default as SearchInput } from './components/molecules/SearchInput';
export { default as PhoneInput } from './components/molecules/PhoneInput';
export { default as PasswordInput } from './components/molecules/PasswordInput';
export { default as Rating } from './components/molecules/Rating';
export { default as ProgressBar } from './components/molecules/ProgressBar';
export { default as Chip } from './components/molecules/Chip';
export { default as Tabs } from './components/molecules/Tabs';
export { default as Tab } from './components/molecules/Tab';

// ============================================================================
// Organisms
// ============================================================================
export { default as Header } from './components/organisms/Header';
export { default as Footer } from './components/organisms/Footer';
export { default as Sidebar } from './components/organisms/Sidebar';
export { default as Navigation } from './components/organisms/Navigation';
export { default as Modal } from './components/organisms/Modal';
export { default as Toast } from './components/organisms/Toast';
export { default as Alert } from './components/organisms/Alert';
export { default as DataTable } from './components/organisms/DataTable';
export { default as Form } from './components/organisms/Form';
export { default as Pagination } from './components/organisms/Pagination';
export { default as SearchBar } from './components/organisms/SearchBar';
export { default as FilterBar } from './components/organisms/FilterBar';
export { default as StatCard } from './components/organisms/StatCard';
export { default as ParkingCard } from './components/organisms/ParkingCard';
export { default as VehicleCard } from './components/organisms/VehicleCard';
export { default as BookingCard } from './components/organisms/BookingCard';
export { default as ChargingCard } from './components/organisms/ChargingCard';
export { default as PaymentCard } from './components/organisms/PaymentCard';
export { default as NotificationCard } from './components/organisms/NotificationCard';
export { default as ProfileCard } from './components/organisms/ProfileCard';

// ============================================================================
// Layouts
// ============================================================================
export { default as Container } from './components/layouts/Container';
export { default as Grid } from './components/layouts/Grid';
export { default as Row } from './components/layouts/Row';
export { default as Col } from './components/layouts/Col';
export { default as Spacer } from './components/layouts/Spacer';
export { default as Section } from './components/layouts/Section';
export { default as DashboardLayout } from './components/layouts/DashboardLayout';
export { default as AuthLayout } from './components/layouts/AuthLayout';
export { default as AppLayout } from './components/layouts/AppLayout';

// ============================================================================
// Hooks
// ============================================================================
export { default as useClickOutside } from './hooks/useClickOutside';
export { default as useDebounce } from './hooks/useDebounce';
export { default as useMediaQuery } from './hooks/useMediaQuery';
export { default as useLocalStorage } from './hooks/useLocalStorage';
export { default as useSessionStorage } from './hooks/useSessionStorage';
export { default as useWindowSize } from './hooks/useWindowSize';
export { default as useToggle } from './hooks/useToggle';
export { default as useForm } from './hooks/useForm';

// ============================================================================
// Theme
// ============================================================================
export { ThemeProvider, useTheme } from './theme/ThemeProvider';
export { default as theme, darkTheme, lightTheme } from './theme';
export type { Theme, ThemeColors, ThemeTypography } from './theme/types';

// ============================================================================
// Utils
// ============================================================================
export { clsx, cn } from './utils/classNames';
export { formatDate, formatCurrency, formatPhone } from './utils/formatters';
export { validateEmail, validatePhone, validatePassword } from './utils/validators';

// ============================================================================
// Types
// ============================================================================
export type { 
  ButtonProps, 
  InputProps, 
  CardProps, 
  ModalProps,
  ToastProps,
  TableProps,
  FormProps,
} from './types';

// ============================================================================
// Styles
// ============================================================================
import './styles/global.css';