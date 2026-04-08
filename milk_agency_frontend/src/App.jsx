import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';

export default function App() {
  return (
    <Router>
      <Navbar />
      <AppRoutes />
    </Router>
  );
}
