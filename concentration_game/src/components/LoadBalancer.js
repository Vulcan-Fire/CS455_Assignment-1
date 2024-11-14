class LoadBalancer {
  constructor(primaryServers) {
    this.primaryServers = primaryServers;
    this.currentIndex = 0;
    
    this.serverHealth = new Map(
      primaryServers.map(server => [server, { 
        healthy: true, 
        lastChecked: Date.now(),
        type: 'primary'
      }])
    );
  }

  getNextServer() {
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
}

const loadBalancer = new LoadBalancer([
  'https://cs455-assignment-1-khsw.onrender.com',
  'https://cs455-assignment-1-copy2-1.onrender.com'
]);

const formatUrl = (baseUrl, endpoint) => {
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.replace(/^\/+/, '');
  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

export const loadBalancedFetch = async (endpoint, options = {}) => {
  let attempts = 0;
  const maxAttempts = loadBalancer.primaryServers.length;
  let lastError = null;
  
  while (attempts < maxAttempts) {
    const server = loadBalancer.getNextServer();
    const url = formatUrl(server, endpoint);
    
    if (!loadBalancer.isServerHealthy(server)) {
      console.log(`Skipping unhealthy server: ${server}`);
      attempts++;
      continue;
    }

    console.log(`Attempt ${attempts + 1}/${maxAttempts} - Requesting: ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Server': server,
          'X-Server-Type': 'primary'
        },
      });

      if (response.ok) {
        return response;
      } else {
        console.log(`Server ${server} returned status ${response.status}`);
        loadBalancer.markServerUnhealthy(server);
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.log(`Error with server ${server}:`, error.message);
      loadBalancer.markServerUnhealthy(server);
      lastError = error;
    }

    attempts++;
  }

  throw new Error(`All servers failed. Last error: ${lastError?.message || 'Unknown error'}`);
};
