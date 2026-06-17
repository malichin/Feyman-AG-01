import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-xl font-bold tracking-tight hover:text-indigo-200 transition-colors">
            WBS Manager
          </Link>
          <div className="flex items-center gap-6">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-indigo-200 ${
                  isActive ? 'text-white border-b-2 border-indigo-200 pb-0.5' : 'text-indigo-200'
                }`
              }
            >
              Progetti
            </NavLink>
            <NavLink
              to="/impostazioni"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-indigo-200 ${
                  isActive ? 'text-white border-b-2 border-indigo-200 pb-0.5' : 'text-indigo-200'
                }`
              }
            >
              Impostazioni
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}
