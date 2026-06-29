/**
 * Omni-Connectors & Plugins Studio API
 * 
 * GET /v1/connectors  — List all omnichannel bot daemons and OAuth connected apps.
 */

import { Router } from 'express'
import { getOmniConnectorHub } from '../lib/connectors/hub'

export const connectorsRoutes = Router()

connectorsRoutes.get('/', (_req, res) => {
  const hub = getOmniConnectorHub()
  res.json({
    object: 'list',
    data: hub.getConnectorList(),
  })
})
