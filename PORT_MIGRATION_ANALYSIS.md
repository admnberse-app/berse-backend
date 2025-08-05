# Port Migration Analysis & Plan

## Current Port Situation (Discovered Issues)

### Running Services
- **Port 5173-5177**: Multiple Vite dev servers (redundant instances)
- **Backend Expected**: Port 3001 (default) or 3000 (based on env vars)

### Configuration Mismatches
1. **Backend config defaults**: Port 3001 (`src/config/index.ts` line 14)
2. **Frontend .env**: Port 3000 (`VITE_API_URL=http://localhost:3000/api`)
3. **Vite proxy**: Port 3000 (`vite.config.ts` line 29)
4. **Service files**: Port 3001 fallback when env var not set

### Services to Consolidate
- **Frontend**: Currently on port 5173 ✓
- **Backend API**: Should proxy to unified port
- **WebSocket**: Should use same port
- **Admin services**: Should use same port
- **Real-time features**: Should use same port

## Migration Strategy

### Phase 1: Create Unified Configuration
- ✅ Create services config with port 5173 as primary
- ✅ Update all service endpoints
- ✅ Configure Vite proxy for internal routing

### Phase 2: Update All Configurations
- Update backend to use port 5173 for API endpoints
- Update frontend services to use consolidated URLs
- Update WebSocket connections
- Update deep links and QR codes

### Phase 3: Testing & Validation
- Test all auth flows on port 5173
- Test all admin functions on port 5173
- Test real-time features on port 5173
- Verify deep links work correctly

### Phase 4: Cleanup
- Stop redundant Vite instances (ports 5174-5177)
- Remove old port references
- Update documentation

## Configuration Changes Required

### 1. Frontend Services Config
Create unified service configuration pointing to port 5173

### 2. Vite Proxy Updates
Configure internal routing for different service types

### 3. Backend Integration
Update backend to work with frontend on same port through proxy

### 4. Environment Variables
Standardize all port references to 5173