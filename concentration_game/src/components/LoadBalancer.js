class LoadBalancer {
  constructor(primaryServers, backupServer) {
    this.primaryServers = primaryServers;
    this.backupServer = backupServer;
    this.currentIndex = 0;
    
    this.serverHealth = new Map([
      ...primaryServers.map(server => [server, { 
        healthy: true, 
        lastChecked: Date.now(),
        type: 'primary'
      }]),
      [backupServer, { 
        healthy: true, 
        lastChecked: Date.now(),
        type: 'backup'
      }]
    ]);
  }

  getNextServer(useBackup = false) {
    if (useBackup) {
      return this.backupServer;
    }
    
    const server = this.primaryServers[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.primaryServers.length;
    return server;
  }

  markServerUnhealthy(server) {
    const now = Date.now();
    const currentHealth = this.serverHealth.get(server);
    
    this.serverHealth.set(server, { 
      ...currentHealth,
      healthy: false, 
      lastChecked: now 
    });

    setTimeout(() => {
      const health = this.serverHealth.get(server);
      this.serverHealth.set(server, {
        ...health,
        healthy: true,
        lastChecked: Date.now()
      });
      console.log(`Server ${server} health reset to healthy`);
    }, 30000);
  }

  isServerHealthy(server) {
    return this.serverHealth.get(server)?.healthy ?? false;
  }

  areAllPrimaryServersUnhealthy() {
    return this.primaryServers.every(server => !this.isServerHealthy(server));
  }
}

const loadBalancer = new LoadBalancer(
  [
    'https://cs455-assignment-1-khsw.onrender.com',
    'https://cs455-assignment-1-copy2-1.onrender.com'
  ],
  'https://cs455-assignment-1-1.onrender.com'
);

const formatUrl = (baseUrl, endpoint) => {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

export const loadBalancedFetch = async (endpoint, options = {}) => {
  let attempts = 0;
  const maxPrimaryAttempts = loadBalancer.primaryServers.length;
  let lastError = null;
  
  while (attempts < maxPrimaryAttempts) {
    const server = loadBalancer.getNextServer();
    const url = formatUrl(server, endpoint);
    
    if (!loadBalancer.isServerHealthy(server)) {
      console.log(`Skipping unhealthy primary server: ${server}`);
      attempts++;
      continue;
    }

    console.log(`Primary attempt ${attempts + 1}/${maxPrimaryAttempts} - Requesting: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Server': server,
          'X-Server-Type': 'primary'
        },
      });

      if (response.status === 401) {
        throw new Error('invalid credentials');
      }

      if (response.ok) {
        console.log(`Request successful on primary server: ${server}`);
        return response;
      } else {
        console.log(`Primary server ${server} returned status ${response.status}`);
        loadBalancer.markServerUnhealthy(server);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw error;
      }
      console.log(`Error with primary server ${server}:`, error.message);
      loadBalancer.markServerUnhealthy(server);
      lastError = error;
    }

    attempts++;
  }

  if (loadBalancer.areAllPrimaryServersUnhealthy()) {
    console.log('All primary servers failed, attempting backup server');
    const backupServer = loadBalancer.getNextServer(true);
    const backupUrl = formatUrl(backupServer, endpoint);

    try {
      console.log('Attempting backup server:', backupUrl);
      const backupResponse = await fetch(backupUrl, {
        ...options,
        headers: {
          ...options.headers,
          'X-Server': backupServer,
          'X-Server-Type': 'backup'
        },
      });

      if (backupResponse.status === 401) {
        throw new Error('Invalid credentials');
      }

      if (backupResponse.ok) {
        console.log('Backup server request successful');
        return backupResponse;
      } else {
        console.log(`Backup server returned status ${backupResponse.status}`);
        loadBalancer.markServerUnhealthy(backupServer);
        throw new Error(`Backup server failed with status ${backupResponse.status}`);
      }
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        throw error;
      }
      console.log('Backup server failed:', error.message);
      loadBalancer.markServerUnhealthy(backupServer);
      throw new Error(`All servers failed, including backup. Last error: ${error.message}`);
    }
  }

  throw new Error(`All primary servers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};
