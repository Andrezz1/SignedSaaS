import { Link as WaspRouterLink, routes } from 'wasp/client/router';

interface BreadcrumbProps {
  pageName: string;
}

const Breadcrumb = ({ pageName }: BreadcrumbProps) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-xl font-semibold text-black dark:text-white">{pageName}</h2>
      <nav>
        <ol className="flex items-center gap-2 text-sm">
          <li>
            <WaspRouterLink to={routes.MembrosRoute.to}>Membros  /</WaspRouterLink>
          </li>
          <li className="text-primary">{pageName}</li>
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
