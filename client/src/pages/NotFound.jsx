// =============================================
// 404 NOT FOUND PAGE
// =============================================

import { Link } from 'react-router-dom';
import { HiHome } from 'react-icons/hi';

const NotFound = () => {
  return (
    <div className="page-wrapper">
      <div className="not-found animate-slideUp">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>Oops! The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          <HiHome /> Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
