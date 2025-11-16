-- Kill all connections from Railway (208.77.246.49)
-- Run this in DigitalOcean database console if manual termination doesn't work

SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'defaultdb'
  AND client_addr = '208.77.246.49'
  AND pid <> pg_backend_pid(); -- Don't kill your own connection

-- Check remaining connections after
SELECT 
    client_addr,
    state,
    COUNT(*) as connection_count,
    MAX(query_start) as oldest_query
FROM pg_stat_activity 
WHERE datname = 'defaultdb'
  AND pid <> pg_backend_pid()
GROUP BY client_addr, state
ORDER BY connection_count DESC;
