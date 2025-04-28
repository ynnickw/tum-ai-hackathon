import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [location, navigate] = useLocation();

  const handleNewSearch = () => {
    sessionStorage.removeItem("searchQuery")
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-primary text-2xl">
            <i className="fas fa-hotel"></i>
          </div>
          <Link href="/" className="text-xl font-semibold text-neutral-800 hover:text-primary transition-colors">
            AI Hotel Finder
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Button
                variant="link"
                className="text-primary hover:text-primary/80"
                onClick={handleNewSearch}
              >
                New Search
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
