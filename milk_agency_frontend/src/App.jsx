import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import AppRoutes from './routes/AppRoutes';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';

export default function App() {
  return (
    <Router>
      <Sidebar>
        <AppRoutes />
      </Sidebar>
    </Router>
  );
}
