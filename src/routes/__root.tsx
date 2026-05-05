import { createRootRoute, Outlet } from '@tanstack/react-router'
import EllipseColor from 'icons/EllipseColor'
import chicken from 'images/chickens.webp'

export const Route = createRootRoute({
  component: () => (
    <div
      className="h-screen w-full flex flex-col"
      style={{
        backgroundImage: `url(${chicken})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute w-full overflow-hidden h-full pointer-events-none">
        <EllipseColor />
      </div>
      <Outlet />
    </div>
  ),
})
