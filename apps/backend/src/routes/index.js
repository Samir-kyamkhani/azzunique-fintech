import tenantRoutes from '../tenants/tenants.routes.js';

export function indexRoutes(app) {
  app.use('/tenants', tenantRoutes);
}
